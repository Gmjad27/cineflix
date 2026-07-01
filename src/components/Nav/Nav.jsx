import React, { useMemo } from 'react';
import './Nav.css';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../assets/image.png';

const Nav = () => {

    // ✅ Parse user only once
    const username = useMemo(() => {
        try {
            const rawUser = localStorage.getItem('user');
            return rawUser ? JSON.parse(rawUser) : null;
        } catch {
            return null;
        }
    }, []);

    // ✅ Profile path
    const profilePath = useMemo(() => {
        return username?.id && username?.name
            ? `/profile?user=${encodeURIComponent(username.name)}`
            : '/profile';
    }, [username]);

    // ✅ Nav items memoized
    const navItems = useMemo(() => [
        { to: '/', icon: 'fa-solid fa-house', label: 'HOME' },
        { to: '/search', icon: 'fa-solid fa-magnifying-glass', label: 'SEARCH' },
        { to: '/tv', icon: 'fa-solid fa-tv', label: 'TV' },
        { to: '/movies', icon: 'fa-solid fa-clapperboard', label: 'MOVIE' },
        { to: profilePath, icon: 'fa-brands fa-product-hunt', label: String(username?.name || 'Guest').toUpperCase() },
    ], [profilePath]);



    return (
        <div className='nav'>
            <Link to="/">
                <img className="applogo" src={logo} alt="cineflix" />
            </Link>
            <div className="logos">
                {navItems.map((item) => (
                    <div className="navlink" key={item.label}>
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                `l ${isActive ? 'active' : ''}`
                            }
                            end={item.to === '/'}
                        >
                            <div className="la">
                                <p className='button'>
                                    <i className={item.icon}></i>
                                </p>
                                <p className='name button'>{item.label}</p>
                            </div>
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Nav;