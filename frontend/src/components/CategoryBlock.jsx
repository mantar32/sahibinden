import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryBlock.css';

const CategoryBlock = ({ category }) => {
    return (
        <Link
            to={`/kategori/${category.slug}`}
            className="category-block"
            style={{ '--category-color': category.color }}
        >
            <div className="category-icon">{category.icon}</div>
            <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-sub-count">
                    {category.subCategories?.length || 0} alt kategori
                </p>
            </div>
            <span className="category-arrow">→</span>
        </Link>
    );
};

export default CategoryBlock;
