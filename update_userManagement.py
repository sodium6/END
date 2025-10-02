from pathlib import Path
path = Path('client/src/pages/admin/users/userManagement.jsx')
text = path.read_text()
text = text.replace("import { Link, useNavigate } from 'react-router-dom';","import { Link, useNavigate } from 'react-router-dom';\nimport useAdminAuth from '../../../hooks/useAdminAuth';")
text = text.replace("  const navigate = useNavigate();","  const navigate = useNavigate();\n  const { admin } = useAdminAuth();\n  const isSuperAdminAccount = admin?.role === 'superadmin';")
text = text.replace("        <Link\n          to=\"/admin/users/create\"\n          className=\"inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700\"\n        >\n          + New Account\n        </Link>","        {isSuperAdminAccount && (\n          <Link\n            to=\"/admin/users/create\"\n            className=\"inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700\"\n          >\n            + New Account\n          </Link>\n        )}")
path.write_text(text)
