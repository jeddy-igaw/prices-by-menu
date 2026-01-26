import React from 'react';
import { ChefHat, Globe, DollarSign, ArrowRight } from 'lucide-react';
import { formatKRW } from '../services/currency';

const MenuCard = ({ item }) => (
    <div className="menu-card">
        <div className="menu-header">
            <h3>{item.name}</h3>
            {item.currency && item.price && (
                <div className="original-price">
                    {item.currency} {item.price}
                </div>
            )}
        </div>

        <div className="korean-name">
            <span className="lang-badge">KR</span> {item.koreanName}
        </div>

        <p className="menu-desc">{item.description}</p>

        {item.convertedPrice && (
            <div className="converted-price-section">
                <div className="conversion-arrow">
                    <ArrowRight size={16} />
                </div>
                <div className="converted-price">
                    {formatKRW(item.convertedPrice)}
                </div>
            </div>
        )}
    </div>
);

export default function MenuList({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="recipe-list-container">
            <h2 className="section-title"><Globe className="inline-icon" /> AI 번역 메뉴판</h2>
            <div className="recipe-grid">
                {items.map((item, index) => (
                    <MenuCard key={index} item={item} />
                ))}
            </div>
        </div>
    );
}
