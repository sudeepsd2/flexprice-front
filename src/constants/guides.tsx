import { TutorialItem } from '@/pages/onboarding/onboarding';

const openGuide = (url: string) => {
	window.open(url, '_blank');
};

const GUIDES: Record<
	string,
	{
		tutorials: TutorialItem[];
	}
> = {
	features: {
		tutorials: [
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/FEATURES1_veomrd.svg',
				title: 'How to create a feature?',
				description: 'Explore how features work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Creating%20a%20feature'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180989/Features2_fbd39s.svg',
				title: 'How to link features to plans?',
				description: 'Link features to plans in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Features/Link%20features%20to%20plans'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180994/FEATURES_3_drkhb7.svg',
				title: 'How to clone open ai pricing?',
				description: 'Clone open ai / cursor style pricing in Flexprice.',
				onClick: () =>
					openGuide(
						'https://docs.flexprice.io/docs/Product%20catalogue/Plans/Use%20cases/Clone%20Open%20AI%20pricing#clone-open-ai-pricing',
					),
			},
		],
	},
	addons: {
		tutorials: [
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/PLAN_1_j6tdqv.svg',
				title: 'How to create an Addon?',
				description: 'Explore how to create a new Addons in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/addons/create-addon'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/PLAN_2_oxi9ld.svg',
				title: 'How to list all Addons?',
				description: 'Explore how to list all Addons.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/addons/list-addons'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180995/PLAN_3_lfh1mi.svg',
				title: 'How to delete an Addon?',
				description: 'Explore how to delete a Addon.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/addons/delete-addon'),
			},
		],
	},
	coupons: {
		tutorials: [
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/PLAN_1_j6tdqv.svg',
				title: 'How to create a coupon?',
				description: 'Explore how to create a new Coupon in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/coupons/create-a-new-coupon'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/PLAN_2_oxi9ld.svg',
				title: 'How to update a coupon?',
				description: 'Explore how to update a Coupon.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/coupons/update-a-coupon'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180995/PLAN_3_lfh1mi.svg',
				title: 'How to delete a coupon?',
				description: 'Explore how to delete a Coupon.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/coupons/delete-a-coupon'),
			},
		],
	},
	plans: {
		tutorials: [
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/PLAN_1_j6tdqv.svg',
				title: 'Explore how plans work in Flexprice.',
				description: 'Explore how plans work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Overview'),
			},
			{
				title: 'How to create a plan',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/PLAN_2_oxi9ld.svg',
				description: 'Create a new plan in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Creating%20a%20plan'),
			},
			{
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180995/PLAN_3_lfh1mi.svg',
				title: 'How to choose between advance and arrear billing?',
				description: 'Understand billing models used in plans.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Product%20catalogue/Plans/Charges%20in%20plans/Advancevsarrear'),
			},
		],
	},
	customers: {
		tutorials: [
			{
				title: 'How to create a customer',
				description: 'Explore how customers work in Flexprice.',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180990/Customer_1_kf0ena.svg',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Overview'),
			},
			{
				title: 'How to archive a customer',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180991/Customer_2_ifiaof.svg',
				description: 'Create a new customer in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Creating%20a%20customer'),
			},
			{
				title: 'How to create a subscription',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180987/Customer_3_triyiv.svg',
				description: 'Create a new subscription in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Customers/Creating%20a%20subscription'),
			},
		],
	},
	invoices: {
		tutorials: [
			{
				title: 'How to create an invoice',
				description: 'Explore how invoices work in Flexprice.',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180993/Invoice_1_lh9ved.svg',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/invoices/create-a-new-invoice#create-a-new-invoice'),
			},
			{
				title: 'How to manage invoices',
				description: 'Manage invoices in Flexprice.',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180991/invoice_2_v8fa71.svg',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/ManagingInvoice'),
			},
			{
				title: 'How to handle partial payments',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180989/iNvoice_3_glq1xo.svg',
				description: 'Handle partial payments in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Invoices/partial_payments'),
			},
		],
	},
	payments: {
		tutorials: [
			{
				title: 'How to create a payment',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753182361/PAYMENTS_1_dgx00f.svg',
				description: 'Explore how payments work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/create-a-new-payment'),
			},
			{
				title: 'How to update a payment',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753182361/PAYMENTS_2_ugsdxt.svg',
				description: 'Create a payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/update-a-payment'),
			},
			{
				title: 'Update a payment',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753203616/PAYMENTS_3_erwdgn_gxkrxv.svg',
				description: 'Update an existing payment in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/payments/delete-a-payment'),
			},
		],
	},
	secrets: {
		tutorials: [
			{
				title: 'List API Keys',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753189165/api1_egeb4f.svg',
				description: 'View all API keys in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/list-api-keys'),
			},
			{
				title: 'Create a new API Key',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753204234/api2_gxkyqw.svg',
				description: 'Generate a new API key in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/create-a-new-api-key'),
			},
			{
				title: 'Delete an API Key',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753184051/api3_ahcbx8.svg',
				description: 'Delete an API key in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/secrets/delete-an-api-key'),
			},
		],
	},
	creditNotes: {
		tutorials: [
			{
				title: 'Create a new credit note',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180987/CN1_vkg2kh.svg',
				description: 'Explore how credit notes work in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/credit-notes/create-a-new-credit-note'),
			},
			{
				title: 'Process a draft credit note',
				description: 'Create a new credit note in Flexprice.',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180988/CN2_gpeaqi.svg',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/credit-notes/process-a-draft-credit-note'),
			},
			{
				title: 'Void a credit note',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753180987/CN3_kpsfpv.svg',
				description: 'Manage credit notes in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/credit-notes/void-a-credit-note'),
			},
		],
	},
	importExport: {
		tutorials: [
			{
				title: 'Overview',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753189165/TASK1_cpgjla.svg',
				description: 'Explore import and export options in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/list-tasks'),
			},
			{
				title: 'Import a file',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753182361/TASKS_2_emkpmn.svg',
				description: 'Import a file into Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/create-a-new-task'),
			},
			{
				title: 'Process import task',
				imageUrl: 'https://res.cloudinary.com/daospvham/image/upload/v1753189166/TASKS_3_k2nkyu.svg',
				description: 'Process an import task in Flexprice.',
				onClick: () => openGuide('https://docs.flexprice.io/api-reference/tasks/process-a-task'),
			},
		],
	},
	taxes: {
		tutorials: [
			{
				title: 'How to create a tax rate?',
				description: 'Learn how to set up tax rates for your billing system.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Taxes/Overview'),
			},
			{
				title: 'Understanding tax types',
				description: 'Explore percentage vs fixed amount tax calculations.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Taxes/TaxTypes'),
			},
			{
				title: 'Tax associations and overrides',
				description: 'Learn how to apply taxes to specific entities.',
				onClick: () => openGuide('https://docs.flexprice.io/docs/Taxes/Associations'),
			},
		],
	},
};

export default GUIDES;
