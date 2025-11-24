import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router';
import { useUser } from '@/hooks/UserContext';
import { PageLoader } from '@/components/atoms';
import useUserhook from '@/hooks/useUser';

interface AuthMiddlewareProps {
	children: ReactNode;
	requiredRole: string[];
}
const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({ children }) => {
	const userContext = useUser();
	const { user, loading, error } = useUserhook();

	useEffect(() => {
		if (user) {
			userContext.setUser(user);
		}
	}, [user, userContext]);

	if (loading) {
		return <PageLoader />;
	}

	if (error || !user) {
		return <Navigate to='/auth' />;
	}

	// if (requiredRole && !requiredRole.includes(user.role)) {
	//     return <Navigate to="/not-authorized" />;
	// }

	// Wrap children with AuthStateListener to handle auth state changes
	return <div>{children}</div>;
};

export default AuthMiddleware;
