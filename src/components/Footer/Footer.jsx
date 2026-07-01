import React from 'react'
import { Link } from 'react-router-dom';
import './Footer.css'

const Footer = () => {
    return (
        <div className='footer'>
            <div className="sec">
                <h3>Company</h3>

                <p><Link to={'/'}>Home</Link></p>
                <p><Link to={'/detail'}>About Us</Link></p>
                <p>Careers</p><br /><br />
                <p>&copy; 2026 GIRISH JADAV M. All Rights Reserved.</p>
                <p>Just a College Project. Not promoting piracy.</p>
                <p>Terms Of Use Privacy Policy FAQ</p>
            </div>
            <div className="sec">
                <h3>View Website in</h3>
                <p>✔ English</p>
            </div>
            <div className="sec">
                <h3>Need Helps?</h3>
                <p>Visit help Center</p>
                <p>Share Feedback</p>
            </div>
            <div className="sec">
                <h3>Connect with Us</h3>

                <div className="sec1">

                    <div className="f1">
                        <Link to={'https://www.instagram.com/jadav_girish_27_18/'}>
                            <h1><i className="fa-brands fa-instagram"></i></h1>
                        </Link>
                        <h1><i className="fa-brands fa-x-twitter"></i></h1>
                    </div>

                    <div className="f1">
                        <div className="l" style={{ backgroundImage: "url('https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/v1661346101/google-playstore')" }}></div>
                        <div className="l" style={{ backgroundImage: "url('https://img10.hotstar.com/image/upload/f_auto,q_90,w_256/v1661346071/ios-appstore')" }}></div>
                    </div>
                </div>
                <p>__________</p>
            </div>
        </div>
    )
}

export default Footer
