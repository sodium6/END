export const listOfLogin = [
  {
    name: 'username',
    placeholder: 'Username',
    label: 'Username',
    type: 'text',
  },
  {
    name: 'password',
    placeholder: 'Password',
    label: 'Password',
    type: 'password',
  },
];

export const listOfSignUp = [
  {
    name: 'firstName',
    label: 'First Name',
    placeholder: 'First Name',
    type: 'text',
    isHalfWidth: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Last Name',
    type: 'text',
    isHalfWidth: true,
  },
  { name: 'username', label: 'Username', placeholder: 'Username', type: 'text' },
  { name: 'password', label: 'Password', placeholder: 'Password', type: 'password' },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
    type: 'password',
  },
];

export const listOfCompanyInfo = [
  { name: 'companyName', label: 'Company Name', placeholder: 'Company Name', type: 'text' },
  {
    name: 'mainAddress',
    label: 'Main Address',
    placeholder: 'Main Address',
    type: 'text',
  },
  {
    name: 'telAddress',
    label: 'Tel Address',
    placeholder: 'Tel Address',
    type: 'text',
  },
  {
    name: 'companySize',
    label: 'Company Size',
    isHalfWidth: true,
    type: 'select',
    options: [
      { id: 1, name: 'Small น้อยกว่า 50 คน' },
      { id: 2, name: 'Medium 51-200 คน' },
      { id: 3, name: 'Large มากกว่า 200 คน' },
    ],
  },
  {
    name: 'legalEntityNumber',
    label: 'Legal Entity Number',
    placeholder: 'Legal Entity Number',
    type: 'text',
    isHalfWidth: true,
  },
];
