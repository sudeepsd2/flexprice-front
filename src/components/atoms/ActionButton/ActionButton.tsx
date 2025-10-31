import { BsThreeDots } from 'react-icons/bs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Dialog } from '@/components/atoms';
import { EyeOff, Pencil } from 'lucide-react';
import { refetchQueries } from '@/core/services/tanstack/ReactQueryProvider';

interface ActionProps {
	id: string;
	editPath?: string;
	deleteMutationFn: (id: string) => Promise<void>;
	refetchQueryKey: string;
	entityName: string;
	row?: any;
	isArchiveDisabled?: boolean;
	isEditDisabled?: boolean;
	onEdit?: () => void;
	archiveText?: string;
	editText?: string;
	archiveIcon?: React.ReactNode;
	editIcon?: React.ReactNode;
	disableToast?: boolean;
}

const ActionButton: FC<ActionProps> = ({
	id,
	editPath,
	onEdit,
	deleteMutationFn,
	refetchQueryKey,
	entityName,
	isArchiveDisabled,
	isEditDisabled,
	archiveText,
	editText,
	archiveIcon,
	editIcon,
	disableToast = false,
}) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const { mutate: deleteEntity } = useMutation({
		mutationFn: deleteMutationFn,
		onSuccess: async () => {
			if (!disableToast) {
				toast.success(`${entityName} ${archiveText?.toLowerCase() || 'archived'} successfully`);
			}
			await refetchQueries(refetchQueryKey);
		},
		onError: (err: ServerError) => {
			if (!disableToast) {
				toast.error(err.error.message || `Failed to ${archiveText?.toLowerCase() || 'archive'} ${entityName}. Please try again.`);
			}
		},
	});

	const handleClick = (e: React.MouseEvent) => {
		// Prevent event from bubbling up to parent elements
		e.preventDefault();
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	return (
		<>
			<div data-interactive='true' onClick={handleClick}>
				<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
					<DropdownMenuTrigger asChild>
						<button>
							<BsThreeDots className='text-base size-4' />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						{!isEditDisabled && (
							<DropdownMenuItem
								onSelect={(event) => {
									event.preventDefault();
									setIsOpen(false);
									if (onEdit) {
										onEdit();
									} else if (editPath) {
										navigate(editPath);
									}
								}}
								className='flex gap-2 items-center w-full cursor-pointer'>
								{editIcon || <Pencil />}
								<span>{editText || 'Edit'}</span>
							</DropdownMenuItem>
						)}
						{!isArchiveDisabled && (
							<DropdownMenuItem
								onSelect={(event) => {
									event.preventDefault();
									setIsOpen(false);
									setIsDialogOpen(true);
								}}
								className='flex gap-2 items-center w-full cursor-pointer'>
								{archiveIcon || <EyeOff />}
								<span>{archiveText || 'Archive'}</span>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Dialog
				title={`Are you sure you want to ${archiveText?.toLowerCase() || 'archive'} this ${entityName}?`}
				titleClassName='text-lg font-normal text-gray-800 w-[90%]'
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				showCloseButton={false}>
				<div className='flex flex-col gap-4 items-end justify-center'>
					<div className='flex gap-4'>
						<Button variant='outline' onClick={() => setIsDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setIsDialogOpen(false);
								deleteEntity(id);
							}}>
							{archiveText || 'Archive'}
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	);
};

export default ActionButton;
