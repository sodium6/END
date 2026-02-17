import { listOfCompanyInfo } from '@/data/auth';
import React from 'react';
import { Input } from './Input';

const InformationAuth = ({
  handleFinalSubmit,
  formData,
  handleCompanySizeChange,
  handleInputChange,
  // handleBack,
  errors,
}) => {
  return (
    <form onSubmit={handleFinalSubmit}>
      <div className="flex flex-wrap -mx-2">
        {listOfCompanyInfo.map((input) => (
          <div
            key={input.name}
            className={`mb-6 px-2 ${input.isHalfWidth ? 'w-full sm:w-1/2' : 'w-full'}`}
          >
            <label
              htmlFor={input.name}
              className="block text-gray-700 text-sm md:text-md font-semibold mb-2"
            >
              {input.label} :
            </label>
            {input.type === 'select' ? (
              <>
                <Input.DropdownInput
                  label={
                    formData.companySize && formData.companySize.name
                      ? formData.companySize.name
                      : 'Company Size'
                  }
                  items={input.options}
                  onSelect={handleCompanySizeChange}
                  from="sign-up"
                />
                {errors[input.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[input.name]}</p>
                )}
              </>
            ) : (
              <>
                <Input.DefaultInput
                  className={`text-sm md:text-md p-3`}
                  type={input.type}
                  id={input.name}
                  name={input.name}
                  placeholder={input.placeholder}
                  value={formData[input.name]}
                  onChange={handleInputChange}
                />
                {errors[input.name] && (
                  <p className="text-red-500 text-xs mt-1">{errors[input.name]}</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        {/* <button
          className="hover:bg-gray-200 bg-gray-100 text-gray-700 cursor-pointer
              font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
          type="button"
          onClick={handleBack}
        >
          Back
        </button> */}
        <button
          className="bg-[#5932EA] hover:bg-[#431DB9] text-white font-semibold cursor-pointer
                py-3 px-4 w-full rounded-lg focus:outline-none focus:shadow-outline transition-colors"
          type="submit"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default InformationAuth;
