import React, { createContext, useState, useContext, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState(() => {
        const saved = localStorage.getItem('compareList');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (listing) => {
        if (compareList.find(item => item.id === listing.id)) {
            return { success: false, message: 'Bu ilan zaten karşılaştırma listesinde.' };
        }
        if (compareList.length >= 3) {
            return { success: false, message: 'En fazla 3 ilan karşılaştırabilirsiniz.' };
        }
        // Check if category matches (optional but recommended)
        if (compareList.length > 0 && compareList[0].category !== listing.category) {
            return { success: false, message: 'Sadece aynı kategorideki ilanları karşılaştırabilirsiniz.' };
        }

        setCompareList(prev => [...prev, listing]);
        return { success: true, message: 'Karşılaştırma listesine eklendi.' };
    };

    const removeFromCompare = (listingId) => {
        setCompareList(prev => prev.filter(item => item.id !== listingId));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    return (
        <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </CompareContext.Provider>
    );
};
