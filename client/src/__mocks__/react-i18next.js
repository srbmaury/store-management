// __mocks__/react-i18next.js
export const useTranslation = () => ({
	t: (key) =>
	({
		name: 'Name',
		phoneNumber: 'Phone Number',
		email: 'Email',
		password: 'Password',
		confirmPassword: 'Confirm Password',
		role: 'Role',
		admin: 'Admin',
		staff: 'Staff',
		register: 'Register',
		login: 'Login',
		alreadyHaveAccount: 'Already have an account?',
		dontHaveAccount: "Don't have an account?",
	}[key] || key),
	i18n: {
		changeLanguage: () => new Promise(() => { }),
	},
});

export const initReactI18next = {
	type: '3rdParty',
	init: () => { },
};
