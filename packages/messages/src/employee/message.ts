export const EMPLOYEE_MESSAGE = {
	TITLE: "Employees",
	NEW_EMPLOYEE: "New Employee",
	EDIT_EMPLOYEE: "Edit Employee",
	NOT_FOUND: "Employee not found.",
	CODE_TAKEN: "An employee with this employee code already exists.",
	EMAIL_TAKEN: "An employee with this email already exists.",
	NIK_TAKEN: "An employee with this NIK (KTP) already exists.",
	EMPTY: "No employees registered yet.",
	SEARCH_PLACEHOLDER: "Search by name, employee code, or department",
	CREATED: "Employee record created successfully.",
	UPDATED: "Employee record updated successfully.",
	DELETED: "Employee record deleted successfully.",
	PDP_CONSENT_TITLE: "Personal Data Protection Consent",
	PDP_CONSENT_DESCRIPTION:
		"Data collected and processed in accordance with Indonesian Personal Data Protection Law (UU PDP No. 27/2022).",
	// Contracts
	CONTRACTS_TITLE: "Employment Contracts",
	CONTRACT_NOT_FOUND: "Employment contract not found.",
	CONTRACT_CREATED: "Employment contract created successfully.",
	CONTRACT_RENEWED: "Employment contract renewed with compensation calculation.",
	CONTRACT_CONVERTED: "Employee converted to permanent employee (PKWTT).",
	COMPENSATION_PAID: "PKWT compensation payment recorded successfully.",
	PKWT_PROBATION_FORBIDDEN:
		"PP 35/2021 forbids probationary periods for PKWT (fixed-term contracts).",
	PKWT_MAX_DURATION_EXCEEDED:
		"PP 35/2021 sets the maximum cumulative PKWT duration at 5 years.",
	// Organization
	DEPARTMENT_CREATED: "Department created successfully.",
	POSITION_CREATED: "Position created successfully.",
} as const;
