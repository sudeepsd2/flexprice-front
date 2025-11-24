import { useParams } from 'react-router';
import EntityChargesPage, { ENTITY_TYPE } from '@/components/organisms/EntityChargesPage';

const AddChargesPage = () => {
	const { planId } = useParams<{ planId: string }>();

	return <EntityChargesPage entityType={ENTITY_TYPE.PLAN} entityId={planId!} entityName='Plan' />;
};

export default AddChargesPage;
