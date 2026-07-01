import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'; // Import this hook
import Card from '../../components/Card/Card';
import styles from './MovieViewAll.module.css';

const MovieViewAll = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    // 1. Initialize the hook to read the URL
    const [searchParams] = useSearchParams();

    // 2. Set up state for your items and title
    const [items, setItems] = useState([]);
    const [pageTitle, setPageTitle] = useState('Full Library');

    useEffect(() => {
        // 3. Get the specific parameters from the URL
        const itemsParam = searchParams.get('items');
        const titleParam = searchParams.get('title');

        if (titleParam) {
            setPageTitle(titleParam);
        }

        if (itemsParam) {
            try {
                // 4. Parse the stringified JSON back into an array
                const parsedItems = JSON.parse(itemsParam);
                setItems(parsedItems);
            } catch (error) {
                console.error("Error parsing items from URL:", error);
                // Fallback if the URL is malformed
                setItems([]);
            }
        }
    }, [searchParams]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button
                    onClick={() => navigate(-1)}
                    className={styles.backButton}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
                {/* Use the dynamic title */}
                <h1>{pageTitle}</h1>
            </header>

            <div className={styles.grid}>
                {items.length > 0 ? (
                    items.map((item) => (
                        <Card
                            key={item.id}
                            sow={props.sow}
                            id={item.id}
                            img={item.name}
                            name={item.name2}
                            ry={item.releaseYear}
                            ua={item.ua}
                            lan={item.language?.length || 0}
                            desc={item.desc}
                            s={item.season}
                            type={item.type}
                            tid={item.tmdbId}
                            add={props.add}
                            e={props.e}
                            play={props.play}
                        />
                    ))
                ) : (
                    <div className={styles.noResults}>
                        <p>No items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieViewAll;