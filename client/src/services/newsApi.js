import api from "./api"; // axios instance (baseURL + token interceptor)

export const getNews = async () => {
    const res = await api.get("/news");
    return res.data;
};

export const getNewsById = async (id) => {
    const res = await api.get(`/news/${id}`);
    return res.data;
};


export const subscribe = async (email) => {
    const res = await api.post("/news/subscribe", { email });
    return res.data;
};

export const unsubscribe = async (email) => {
    const res = await api.post("/news/unsubscribe", { email });
    return res.data;
};
