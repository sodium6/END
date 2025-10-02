from pathlib import Path
path = Path('client/src/pages/admin/users/UserFormPage.jsx')
text = path.read_text()

if "useAdminAuth" not in text:
    text = text.replace("import { adminApi } from '../../../services/adminApi';", "import { adminApi } from '../../../services/adminApi';\nimport useAdminAuth from '../../../hooks/useAdminAuth';")

text = text.replace("  const navigate = useNavigate();", "  const navigate = useNavigate();\n  const { admin, loading: authLoading } = useAdminAuth();\n  const isSuperAdmin = admin?.role === 'superadmin';", 1)

text = text.replace("  const isEditing = !!id;\n\n", "  const isEditing = !!id;\n\n  useEffect(() => {\n    if (!authLoading && !isSuperAdmin) {\n      navigate('/admin/users', { replace: true });\n    }\n  }, [authLoading, isSuperAdmin, navigate]);\n\n", 1)

text = text.replace("useEffect(() => {\n    if (isEditing) {\n      setLoading(true);\n      adminApi\n        .getUserById(id)\n        .then((data) =>\n          setUser((prev) => ({\n            ...prev,\n            accountType: 'admin',\n            username: data.user.username,\n            full_name: data.user.full_name,\n            email: data.user.email,\n            role: data.user.role,\n            status: data.user.status || 'active',\n            password: '',\n          }))\n        )\n        .catch((err) => {\n          const message = err?.response?.data?.message || err.message || 'Failed to fetch user';\n          setError(message);\n        })\n        .finally(() => setLoading(false));\n    }\n  }, [id, isEditing]);", "useEffect(() => {\n    if (!isEditing || !isSuperAdmin) {\n      return;\n    }\n\n    setLoading(true);\n    adminApi\n      .getUserById(id)\n      .then((data) =>\n        setUser((prev) => ({\n          ...prev,\n          accountType: 'admin',\n          username: data.user.username,\n          full_name: data.user.full_name,\n          email: data.user.email,\n          role: data.user.role,\n          status: data.user.status || 'active',\n          password: '',\n        }))\n      )\n      .catch((err) => {\n        const message = err?.response?.data?.message || err.message || 'Failed to fetch user';\n        setError(message);\n      })\n      .finally(() => setLoading(false));\n  }, [id, isEditing, isSuperAdmin]);")

text = text.replace("  return (\n", "  if (authLoading) {\n    return <div className=\"p-6 text-gray-500\">Loading...</div>;\n  }\n\n  if (!isSuperAdmin) {\n    return null;\n  }\n\n  return (\n", 1)

path.write_text(text)
