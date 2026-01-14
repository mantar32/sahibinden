import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
    return (
        <Helmet>
            <title>{title ? `${title} | sahibinden.com` : 'sahibinden.com: Satılık, Kiralık, Emlak, Oto, Alışveriş Ürünleri'}</title>
            <meta name="description" content={description || 'Sahibinden satılık, kiralık, ikinci el, otomobil, emlak ve her türlü ürün - Türkiye\'nin en büyük ücretsiz ilan ve online alışveriş sitesi.'} />
            <meta name="keywords" content={keywords || 'sahibinden, satılık, kiralık, emlak, otomobil, araba, alışveriş, ürün, ilan, ikinci el'} />
        </Helmet>
    );
};

export default SEO;
