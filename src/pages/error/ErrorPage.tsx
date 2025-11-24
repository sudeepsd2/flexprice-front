import { Button, Spacer } from '@/components/atoms';
import { RouteNames } from '@/core/routes/Routes';
import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';

const ErrorPage = () => {
	return (
		<div className='h-screen w-full flex justify-center items-center'>
			<div className='w-full flex flex-col items-center '>
				<TriangleAlert className='size-28' />
				<p className='font-sans text-2xl font-bold'>404 Error Page</p>
				<p className='text-[#71717A] font-normal '>Oops! Looks like you took a wrong turn</p>
				<Spacer height={'16px'} />
				<Link to={RouteNames.home}>
					<Button>
						<span>Back to Home</span>
					</Button>
				</Link>
			</div>
		</div>
	);
};

export default ErrorPage;
