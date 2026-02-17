import api from "./api"; // axios instance (baseURL + token interceptor)

// ---------------- USERS ----------------
export const getUser = async (id) => {
  const res = await api.get(`/portfolio/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.put(`/portfolio/users/${id}`, data);
  return res.data;
};

// ---------------- WORK EXPERIENCES ----------------
export const getWork = async (userId) => {
  const res = await api.get(`/portfolio/work/${userId}`);
  return res.data;
};

export const addWork = async (userId, data) => {
  const res = await api.post(`/portfolio/work/${userId}`, data);
  return res.data;
};

export const updateWork = async (id, data) => {
  const res = await api.put(`/portfolio/work/${id}`, data);
  return res.data;
};

export const deleteWork = async (id) => {
  const res = await api.delete(`/portfolio/work/${id}`);
  return res.data;
};

// services/portfolioApi.js   
export const uploadWorkFiles = async (userId, workId, fileListOrArray) => {
  const fd = new FormData();

  // กัน undefined/null
  const filesArr = Array.isArray(fileListOrArray)
    ? fileListOrArray
    : Array.from(fileListOrArray || []);

  if (!filesArr.length) {
    throw new Error("No files to upload");
  }

  for (const f of filesArr) {
    fd.append("files", f);
  }

  const res = await api.post(
    `/portfolio/work/${userId}/${workId}/files`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data; // { files: [...] }
};

export const listWorkFiles = async (userId, workId) => {
  const res = await api.get(`/portfolio/work/${userId}/${workId}/files`);
  return res.data; // [{id,wkId,userId,filePath},...]
};

export const deleteWorkFile = async (fileId) => {
  const res = await api.delete(`/portfolio/work/files/${fileId}`);
  return res.data;
};




// ---------------- ACTIVITIES ----------------
export const getActivities = async (userId) => {
  const res = await api.get(`/portfolio/activities/${userId}`);
  return res.data;
};

export const addActivity = async (userId, data) => {
  const res = await api.post(`/portfolio/activities/${userId}`, data);
  return res.data;
};

export const updateActivity = async (id, data) => {
  const res = await api.put(`/portfolio/activities/${id}`, data);
  return res.data;
};

export const deleteActivity = async (id) => {
  const res = await api.delete(`/portfolio/activities/${id}`);
  return res.data;
};

export const uploadActivityFiles = async (userId, activityId, fileListOrArray) => {
  const fd = new FormData();
  const filesArr = Array.isArray(fileListOrArray)
    ? fileListOrArray
    : Array.from(fileListOrArray || []);
  if (!filesArr.length) throw new Error("No files to upload");
  for (const f of filesArr) fd.append("files", f);

  const res = await api.post(
    `/portfolio/${userId}/activities/${activityId}/photos`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data; // { files: [...] }
};


export const listActivityFiles = async (userId, activityId) => {
  // /:userId/activities/:activityId/photos
  const res = await api.get(`/portfolio/${userId}/activities/${activityId}/photos`);
  return res.data; // [{id,filePath,originalName,sizeBytes}, ...]
};


export const deleteActivityFile = async (userId, imageId) => {
  const res = await api.delete(`/portfolio/${userId}/activities/files/${imageId}`);
  return res.data;
};


// ---------------- SPORTS ----------------
export const getSports = async (userId) => {
  const res = await api.get(`/portfolio/sports/${userId}`);
  return res.data;
};

export const addSport = async (userId, data) => {
  const res = await api.post(`/portfolio/sports/${userId}`, data);
  return res.data;
};

export const updateSport = async (id, data) => {
  const res = await api.put(`/portfolio/sports/${id}`, data);
  return res.data;
};

export const deleteSport = async (id) => {
  const res = await api.delete(`/portfolio/sports/${id}`);
  return res.data;
};