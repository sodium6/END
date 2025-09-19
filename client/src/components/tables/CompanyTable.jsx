import React from 'react';

const CompanyTable = () => {
  const companies = [
    {
      id: 1,
      name: 'Jane Cooper',
      username: 'BIGlnwza',
      tel: '(225) 555-0118',
      email: 'jane@microsoft.com',
      country: 'United States',
      role: 'Super Admin',
    },
    {
      id: 2,
      name: 'John Smith',
      username: 'johnny',
      tel: '(310) 456-7890',
      email: 'john.smith@gmail.com',
      country: 'Canada',
      role: 'Admin',
    },
    {
      id: 3,
      name: 'Siriwan K.',
      username: 'siriwan23',
      tel: '081-234-5678',
      email: 'siriwan@example.co.th',
      country: 'Thailand',
      role: 'Manager',
    },
    {
      id: 4,
      name: 'Carlos Mendoza',
      username: 'cmendoza',
      tel: '(505) 321-9087',
      email: 'carlos@empresa.mx',
      country: 'Mexico',
      role: 'Staff',
    },
  ];

  return (
    <div className="responsive-table-wrapper">
      <table className="table">
        <thead className="thead-table">
          <CompanyTableHeader />
        </thead>
        <tbody className="tbody-table">
          <CompanyTableRow data={companies} />
        </tbody>
      </table>
    </div>
  );
};

const CompanyTableHeader = () => {
  return (
    <tr className="tr-table">
      <th className="th-table min-w-38 lg:min-w-fit">ชื่อ</th>
      <th className="th-table">ID</th>
      <th className="th-table min-w-38 lg:min-w-fit">เบอร์โทร</th>
      <th className="th-table">Email</th>
      <th className="th-table">Country</th>
      <th className="th-table min-w-38 ">Role</th>
    </tr>
  );
};

const CompanyTableRow = ({ data }) => {
  return data?.map((company) => (
    <tr key={company.id} className="tr-table">
      <td className="td-table">{company.name}</td>
      <td className="td-table">{company.username}</td>
      <td className="td-table">{company.tel}</td>
      <td className="td-table">{company.email}</td>
      <td className="td-table">{company.country}</td>
      <td className="td-table">
        <span
          className={`span-table
                    ${company.role === 'Super Admin' ? 'bg-red-100 text-red-800' : ''}
                    ${company.role === 'Admin' ? 'bg-purple-100 text-purple-800' : ''}
                    ${company.role === 'Manager' ? 'bg-green-100 text-green-800' : ''}
                    ${company.role === 'Staff' ? 'bg-gray-100 text-gray-800' : ''}
                  `}
        >
          {company.role}
        </span>
      </td>
    </tr>
  ));
};
export default CompanyTable;
