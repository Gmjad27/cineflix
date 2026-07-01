import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Card.module.css';

const Card2 = ({ himg, bg, studio, stu, color }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Safely encode the studio name in case it contains spaces or special characters
    const path = `/studio?studio_name=${encodeURIComponent(studio)}`;

    return (
        <div className={styles.studiocard}>
            <Link
                to={path}
                aria-label={`Visit ${studio} studio`}
                onClick={() => {
                    if (typeof stu === "function") stu();
                }}
            >
                <div
                    className={styles.card2}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        backgroundImage: `url(${isHovered ? himg : bg})`,
                        "--studiocolor": color
                    }}
                >
                    {/* Add a visually hidden span here if screen readers need more context */}
                </div>
            </Link>
        </div>
    );
};

export default Card2;