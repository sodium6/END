import { useState } from 'react';
import CompanyTable from '@/components/tables/CompanyTable';
import Pagination from '@/components/ui/Pagination';
import { ImageUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import SearchCompanent from '@/components/ui/searchCompanent';

const companySizeOptions = [
  { id: 1, name: 'ขนาดเล็ก (1-50 คน)' },
  { id: 2, name: 'ขนาดกลาง (51-200 คน)' },
  { id: 3, name: 'ขนาดใหญ่ (201-500 คน)' },
  { id: 4, name: 'ใหญ่มาก (500 คนขึ้นไป)' },
];

const initialCompanyAddressState = {
  legalEntityNumber: '',
  companyName: '',
  companyDescription: '',
  companySize: null,
  logoFile: null,
  logoPreviewUrl: null,
  mainAddress: '',
  street: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  contactNumber: '',
};

const CompanyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [companyData, setCompanyData] = useState(initialCompanyAddressState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCompanySizeChange = (selectedOption) => {
    setCompanyData((prevData) => ({ ...prevData, companySize: selectedOption }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData((prevData) => ({
        ...prevData,
        logoFile: file,
        logoPreviewUrl: URL.createObjectURL(file),
      }));
    } else {
      setCompanyData((prevData) => ({
        ...prevData,
        logoFile: null,
        logoPreviewUrl: null,
      }));
    }
  };

  const handleCancel = () => {
    setCompanyData(initialCompanyAddressState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting company data:', companyData);
  };

  const companyInfoFields = [
    { label: 'เลขนิติบุคคล', name: 'legalEntityNumber' },
    { label: 'ชื่อบริษัท', name: 'companyName' },
  ];

  const addressFields = [
    { label: 'ที่อยู่หลัก', name: 'mainAddress' },
    { label: 'ถนน', name: 'street' },
    { label: 'ตำบล / แขวง', name: 'subDistrict' },
    { label: 'อำเภอ / เขต', name: 'district' },
    { label: 'จังหวัด', name: 'province' },
    { label: 'รหัสไปรษณีย์', name: 'postalCode' },
    { label: 'เบอร์ติดต่อ', name: 'contactNumber' },
  ];

  return (
    <main className="min-h-screen space-y-6">
      <article className="article">
        <form className="flex flex-col gap-6 lg:flex-row" onSubmit={handleSubmit}>
          {/* Company Information Section */}
          <section className="w-full space-y-4 lg:w-1/2">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 lg:border-b-0">
              <h1 className="text-2xl font-semibold text-gray-800">รายละเอียดบริษัท</h1>
              <Input.DropdownInput
                label={companyData.companySize?.name || 'ขนาดบริษัท'}
                items={companySizeOptions}
                onSelect={handleCompanySizeChange}
              />
            </div>
            <div className="flex w-full flex-col justify-between gap-4 sm:flex-row">
              {/* Logo Upload Section */}
              <label
                className="relative flex h-36 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-[1px] border-dashed border-gray-300 bg-white px-4 py-8
                         transition duration-200 ease-in-out hover:border-[#5932EA] hover:text-[#5932EA] sm:w-58"
              >
                {companyData.logoPreviewUrl ? (
                  <img
                    src={companyData.logoPreviewUrl}
                    alt="Company Logo Preview"
                    className="absolute inset-0 h-full w-full object-contain p-2"
                  />
                ) : (
                  <>
                    <ImageUp size={22} />
                    <span className="mt-2 text-sm text-gray-700">อัปโหลดโลโก้</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </label>
              {/* Company Info Fields */}
              <div className="flex w-full flex-col gap-3">
                {companyInfoFields.map((field) => (
                  <div className="flex w-full flex-col" key={field.name}>
                    <label className="mb-1 font-medium text-gray-700">{field.label}</label>
                    <Input.DefaultInput
                      className="input-field p-2"
                      placeholder={field.label}
                      name={field.name}
                      value={companyData[field.name]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Company Description Textarea */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">รายละเอียดบริษัท</label>
              <Input.TextAreaInput
                placeholder="รายละเอียดบริษัท"
                className="h-[120px] resize-none rounded-md border border-gray-300 p-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#5932EA]"
                name="companyDescription"
                value={companyData.companyDescription}
                onChange={handleInputChange}
              ></Input.TextAreaInput>
            </div>
          </section>

          {/* Company Address Section */}
          <section className="h-full w-full space-y-4 lg:w-1/2">
            <h2 className="border-b border-gray-100 pb-2 text-2xl font-semibold text-gray-800 lg:border-b-0">
              ที่อยู่บริษัท
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {addressFields.map((field) => (
                <div className="flex flex-col" key={field.name}>
                  <label className="mb-1 font-medium text-gray-700">{field.label}</label>
                  <Input.DefaultInput
                    className="p-2 text-sm"
                    placeholder={field.label}
                    name={field.name}
                    value={companyData[field.name]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>
            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                type="button"
                className="cursor-pointer rounded-lg bg-gray-100 px-5 py-2 font-semibold text-gray-700 transition duration-200 ease-in-out hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-[#5932EA] px-5 py-2 font-semibold text-white transition duration-200 ease-in-out hover:bg-[#4a2bbd]"
              >
                ยืนยันข้อมูล
              </button>
            </div>
          </section>
        </form>
      </article>

      {/* Company User Table Section */}
      <article className="article space-y-6">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <h1 className="mb-4 text-2xl font-semibold text-gray-800 md:mb-0">ผู้ใช้ในบริษัท</h1>
          <SearchCompanent
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CompanyTable />
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">Showing data 1 to 4 of 258 entries</p>
          <Pagination currentPage={page} totalPages={40} onPageChange={setPage} />
        </div>
      </article>
    </main>
  );
};

export default CompanyManagement;
