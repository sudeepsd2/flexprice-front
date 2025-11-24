import { useParams } from 'react-router';
import CreditNoteDetails from './CreditNoteDetails';

const CreditNoteDetailsPage = () => {
	const { credit_note_id: creditNoteId } = useParams();

	return (
		<>
			<CreditNoteDetails breadcrumb_index={2} credit_note_id={creditNoteId!} />
		</>
	);
};

export default CreditNoteDetailsPage;
