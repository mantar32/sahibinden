import React, { useState, useEffect, useCallback } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // Touch handling state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Min swipe distance
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            prevImage();
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="gallery-placeholder">
                <span>📷</span>
                <p>Görsel bulunamadı</p>
            </div>
        );
    }

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showModal) return;

            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') setShowModal(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal, nextImage, prevImage]);

    return (
        <>
            <div className="image-gallery">
                <div className="gallery-main">
                    <img
                        src={images[currentIndex]}
                        alt={`Görsel ${currentIndex + 1}`}
                        className="gallery-main-image"
                        onClick={() => setShowModal(true)}
                    />

                    <div className="gallery-overlay-hint">
                        🔍 Büyütmek için tıkla
                    </div>

                    {images.length > 1 && (
                        <>
                            <button className="gallery-nav gallery-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                                <i className="icon-arrow-left"></i>
                            </button>
                            <button className="gallery-nav gallery-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                                <i className="icon-arrow-right"></i>
                            </button>
                        </>
                    )}

                    <div className="gallery-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                </div>

                {images.length > 1 && (
                    <div className="gallery-thumbnails">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            >
                                <img src={image} alt={`Küçük resim ${index + 1}`} loading="lazy" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal / Lightbox */}
            {showModal && (
                <div className="gallery-modal animate-fade-in" onClick={() => setShowModal(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            ✕
                        </button>

                        <div className="modal-image-container">
                            <img
                                src={images[currentIndex]}
                                alt={`Görsel ${currentIndex + 1}`}
                                className="modal-image animate-scale-in"
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button className="modal-nav modal-prev" onClick={prevImage}>
                                    ❮
                                </button>
                                <button className="modal-nav modal-next" onClick={nextImage}>
                                    ❯
                                </button>
                            </>
                        )}

                        <div className="modal-footer">
                            <div className="modal-counter">
                                {currentIndex + 1} / {images.length}
                            </div>
                            <div className="modal-thumbnails">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`modal-thumbnail ${index === currentIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentIndex(index)}
                                    >
                                        <img src={image} alt={`Küçük resim ${index + 1}`} loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;
