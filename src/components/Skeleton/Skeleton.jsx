import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({ type = 'card', count = 5 }) => {
    if (type === 'card') {
        return (
            <div className={styles.skeletonGrid}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <div className={styles.skeletonImage}></div>
                        <div className={styles.skeletonTitle}></div>
                        <div className={styles.skeletonRating}></div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'banner') {
        return (
            <section className={styles.skeletonBanner}>
                <div className={styles.bannerContent}>
                    <div className={styles.skeletonBadge}></div>
                    <div className={styles.skeletonLargeTitle}></div>
                    <div className={styles.skeletonMeta}></div>
                    <div className={styles.skeletonDescription}></div>
                    <div className={styles.skeletonButtons}>
                        <div className={styles.skeletonButton}></div>
                        <div className={styles.skeletonButton}></div>
                    </div>
                </div>
            </section>
        );
    }

    if (type === 'section') {
        return (
            <section className={styles.skeletonSection}>
                <div className={styles.skeletonSectionTitle}></div>
                <div className={styles.skeletonGrid}>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={styles.skeletonImage}></div>
                            <div className={styles.skeletonTitle}></div>
                            <div className={styles.skeletonRating}></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return null;
};

export default Skeleton;
