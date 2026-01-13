import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="gallery-placeholder">
                <span>📷</span>
                <p>Görsel bulunamadı</p>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

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

                    {images.length > 1 && (
                        <>
                            <button className="gallery-nav gallery-prev" onClick={prevImage}>
                                ←
                            </button>
                            <button className="gallery-nav gallery-next" onClick={nextImage}>
                                →
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
                                <img src={image} alt={`Küçük resim ${index + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {showModal && (
                <div className="gallery-modal" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            ✕
                        </button>

                        <img
                            src={images[currentIndex]}
                            alt={`Görsel ${currentIndex + 1}`}
                            className="modal-image"
                        />

                        {images.length > 1 && (
                            <>
                                <button className="modal-nav modal-prev" onClick={prevImage}>
                                    ←
                                </button>
                                <button className="modal-nav modal-next" onClick={nextImage}>
                                    →
                                </button>
                            </>
                        )}

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
                                    <img src={image} alt={`Küçük resim ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;
