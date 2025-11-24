import { useParams } from 'react-router';
import { EntityChargesPage, ENTITY_TYPE } from '@/components/organisms';

const CostSheetChargesPage = () => {
	const { costSheetId } = useParams<{ costSheetId: string }>();

	return <EntityChargesPage entityType={ENTITY_TYPE.COST_SHEET} entityId={costSheetId!} entityName='Cost Sheet' />;
};

export default CostSheetChargesPage;
