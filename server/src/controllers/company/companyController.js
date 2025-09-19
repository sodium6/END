const { NotFoundError } = require('../../utils/error.js');

module.exports = {
  getsCompany: async (req, res) => {
    try {
      const { search, limit, currentPage } = req.query;
      
      return res.json({
        message: 'getsCompany',
      });
    } catch (error) {
      throw error;
    }
  },
  getCompany: async (req, res) => {
    try {
      const { id } = await req.params;

      if (id === '1') {
        throw new NotFoundError(`not found id = ${id}`);
      }

      return res.json({
        success: true,
        id,
      });
    } catch (error) {
      throw error;
    }
  },
  createCompany: async (req, res) => {
    try {
      const { name } = req.body;
      return res.json({
        name,
      });
    } catch (error) {
      throw error;
    }
  },
  updateCompany: async (req, res) => {},
  deleteCompany: async (req, res) => {},
};
