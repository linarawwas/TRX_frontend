// redux/actions.js
export const setToken = (token) => ({
    type: 'SET_TOKEN',
    payload: token,
  });
  
  export const setCompanyId = (companyId) => ({
    type: 'SET_COMPANY_ID',
    payload: companyId,
  });
