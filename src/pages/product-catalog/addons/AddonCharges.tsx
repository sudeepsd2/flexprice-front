import { useParams } from 'react-router';
import EntityChargesPage, { ENTITY_TYPE } from '@/components/organisms/EntityChargesPage';

const AddonChargesPage = () => {
	const { addonId } = useParams<{ addonId: string }>();

	return <EntityChargesPage entityType={ENTITY_TYPE.ADDON} entityId={addonId!} entityName='Addon' />;
};

export default AddonChargesPage;
