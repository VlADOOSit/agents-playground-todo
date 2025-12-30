export const getQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        page: parseInt(urlParams.get('page')) || 1,
        status: urlParams.get('status') || 'ALL',
        sort: urlParams.get('sort') || 'createdAt'
    };
};

export const updateQueryParams = (params) => {
    const url = new URL(window.location);
    const searchParams = url.searchParams;

    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'ALL' && value !== 'createdAt' && value !== 1) {
            searchParams.set(key, value);
        } else if (key === 'page' && value !== 1) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
    });

    window.history.pushState({}, '', url.toString());
};

export const getInitialState = () => {
    return getQueryParams();
};
