import { Button, Input, Spacer } from '@/components/atoms';
import { FC, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import WalletApi from '@/api/WalletApi';
import toast from 'react-hot-toast';
import { getCurrencySymbol } from '@/utils';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';
import { WALLET_TRANSACTION_REASON } from '@/models';
import { v4 as uuidv4 } from 'uuid';
import { getCurrencyAmountFromCredits } from '@/utils';
import { DebitWalletPayload } from '@/types';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

interface DebitPayload extends Partial<DebitWalletPayload> {
	credits?: number;
	reference_id?: string;
}

interface DebitCardProps {
	walletId?: string;
	currency?: string;
	conversion_rate?: number;
	onSuccess?: () => void;
}

const DebitCard: FC<DebitCardProps> = ({ walletId, currency, conversion_rate = 1, onSuccess }) => {
	// State management
	const [debitPayload, setDebitPayload] = useState<DebitPayload>({
		credits: undefined,
		reference_id: undefined,
	});

	// Centralized data refetching logic
	const refetchWalletData = useCallback(async () => {
		await Promise.all([
			refetchQueries(['fetchWallets']),
			refetchQueries(['fetchWalletBalances']),
			refetchQueries(['fetchWalletsTransactions']),
		]);
	}, []);

	// Validate debit payload
	const validateDebit = useCallback((): boolean => {
		const { credits } = debitPayload;

		if (!credits || credits <= 0) {
			toast.error('Please enter a valid credits amount');
			return false;
		}

		return true;
	}, [debitPayload]);

	// Wallet debit mutation with improved error handling
	const { isPending, mutate: debitWallet } = useMutation({
		mutationKey: ['debitWallet', walletId],
		mutationFn: () => {
			// Comprehensive validation before debit
			if (!walletId) {
				throw new Error('Wallet ID is required');
			}

			if (!debitPayload.credits || debitPayload.credits <= 0) {
				throw new Error('Invalid credits amount');
			}

			return WalletApi.debitWallet({
				walletId,
				credits: debitPayload.credits,
				idempotency_key: debitPayload.reference_id || uuidv4(),
				transaction_reason: WALLET_TRANSACTION_REASON.MANUAL_BALANCE_DEBIT,
			});
		},
		onSuccess: async () => {
			toast.success('Wallet debited successfully');
			onSuccess?.();
			setDebitPayload({
				credits: undefined,
				reference_id: undefined,
			});
			await refetchWalletData();
		},
		onError: (error: ServerError) => {
			toast.error(error.error.message || 'Failed to debit wallet');
		},
	});

	// Handle debit submission
	const handleDebit = useCallback(() => {
		if (validateDebit() && walletId) {
			debitWallet();
		}
	}, [validateDebit, walletId, debitWallet]);

	// Update payload with type-safe setter
	const updateDebitPayload = useCallback((updates: Partial<DebitPayload>) => {
		setDebitPayload((prev) => ({
			...prev,
			...updates,
		}));
	}, []);

	return (
		<DialogContent className='bg-white sm:max-w-[600px]'>
			<DialogHeader>
				<DialogTitle>Manual Debit</DialogTitle>
			</DialogHeader>
			<div className='grid gap-4 py-4'>
				<p className='text-sm text-gray-500'>Manually debit the credits from your wallet. This action will reduce the wallet balance.</p>

				<Input
					variant='formatted-number'
					onChange={(e) => updateDebitPayload({ credits: e as unknown as number })}
					value={debitPayload.credits ?? ''}
					suffix='credits'
					label='Credits to Deduct'
					placeholder='Enter credits amount'
					description={
						<>
							{debitPayload.credits && debitPayload.credits > 0 && (
								<span>
									{getCurrencySymbol(currency!)}
									{getCurrencyAmountFromCredits(conversion_rate, debitPayload.credits ?? 0)}
									{` will be debited from the wallet`}
								</span>
							)}
						</>
					}
				/>

				<Input
					label='Reference ID (Optional)'
					className='w-full'
					placeholder='Enter reference ID'
					value={debitPayload.reference_id || ''}
					onChange={(e) => updateDebitPayload({ reference_id: e as string })}
					description='This reference ID will be used as the idempotency key for the transaction.'
				/>
			</div>

			<Spacer className='!mt-4' />

			<div className='w-full justify-end flex'>
				<Button isLoading={isPending} onClick={handleDebit} disabled={isPending || !debitPayload.credits}>
					Submit
				</Button>
			</div>
		</DialogContent>
	);
};

export default DebitCard;
