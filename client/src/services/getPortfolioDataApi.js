import api from "./api";

export const getPortfolioData = async (userId) => {
    const res = await api.get(`/data/data/${userId}`);
    return res.data;
};
