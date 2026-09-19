import React from 'react';
import { Link } from 'react-router-dom';
import { House, ArrowLeft } from '@phosphor-icons/react';
import styled from 'styled-components';

const FaceWrapper = styled.div`
  .my-custom-face-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 280px;
    background: transparent;
    color: #00B5DC;
  }

  .my-custom-face-container .face {
    width: 240px;
  }

  .my-custom-face-container .face__eyes,
  .my-custom-face-container .face__eye-lid,
  .my-custom-face-container .face__mouth-left,
  .my-custom-face-container .face__mouth-right,
  .my-custom-face-container .face__nose,
  .my-custom-face-container .face__pupil {
    animation: eyes 1s 0.3s forwards;
  }

  .my-custom-face-container .face__eye-lid,
  .my-custom-face-container .face__pupil {
    animation-duration: 4s;
    animation-delay: 1.3s;
    animation-iteration-count: infinite;
  }

  .my-custom-face-container .face__eye-lid {
    animation-name: eye-lid;
  }
  .my-custom-face-container .face__mouth-left {
    animation-name: mouth-left;
  }
  .my-custom-face-container .face__mouth-right {
    animation-name: mouth-right;
  }
  .my-custom-face-container .face__nose {
    animation-name: nose;
  }
  .my-custom-face-container .face__pupil {
    animation-name: pupil;
  }

  @keyframes eye-lid {
    0%,
    40%,
    45%,
    100% {
      transform: translateY(0);
    }
    42.5% {
      transform: translateY(17.5px);
    }
  }

  @keyframes eyes {
    from {
      transform: translateY(112.5px);
    }
    to {
      transform: translateY(15px);
    }
  }

  @keyframes pupil {
    0%,
    37.5%,
    40%,
    45%,
    87.5%,
    100% {
      stroke-dashoffset: 0;
      transform: translate(0, 0);
    }
    12.5%,
    25%,
    62.5%,
    75% {
      transform: translate(-35px, 0);
    }
    42.5% {
      stroke-dashoffset: 35;
      transform: translate(0, 17.5px);
    }
  }

  @keyframes mouth-left {
    from,
    50% {
      stroke-dashoffset: -102;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes mouth-right {
    from,
    50% {
      stroke-dashoffset: 102;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes nose {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(0, 22.5px);
    }
  }
`;

const NotFound = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            fontFamily: '"Inter", "Roboto", sans-serif',
            padding: '20px'
        }}>
            <style>{`
                .nf-container {
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                    position: relative;
                }
                .nf-404-wrapper {
                    position: relative;
                    margin-bottom: 2rem;
                }
                .nf-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    position: relative;
                    z-index: 10;
                }
                .nf-title {
                    font-size: 2rem;
                    color: #1e293b;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }
                .nf-desc {
                    color: #64748b;
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                .nf-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .nf-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px 28px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }
                .nf-btn-back {
                    background: #ffffff;
                    color: #475569;
                    border: 1px solid #cbd5e1;
                }
                .nf-btn-back:hover {
                    background: #f1f5f9;
                    border-color: #94a3b8;
                    transform: translateY(-2px);
                }
                .nf-btn-home {
                    background: linear-gradient(to right, #00d2ff, #00b4db);
                    color: #ffffff;
                    border: none;
                    box-shadow: 0 10px 20px rgba(0, 210, 255, 0.3);
                }
                .nf-btn-home:hover {
                    background: linear-gradient(to right, #00c6f0, #00a5c9);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(0, 210, 255, 0.4);
                    color: #ffffff;
                }
                
                @keyframes pulse-glow {
                    0% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.1; }
                    100% { transform: scale(1); opacity: 0.3; }
                }
                .nf-blob-1, .nf-blob-2 {
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    border-radius: 50%;
                    filter: blur(40px);
                    z-index: -1;
                    animation: pulse-glow 6s infinite ease-in-out;
                }
                .nf-blob-1 {
                    background: #00d2ff;
                    top: -50px;
                    left: 0;
                }
                .nf-blob-2 {
                    background: #3a7bd5;
                    bottom: -50px;
                    right: 0;
                    animation-delay: 3s;
                }
            `}</style>

            <div className="nf-container">
                <div className="nf-404-wrapper">
                    <div className="nf-blob-1"></div>
                    <div className="nf-blob-2"></div>
                    
                    <FaceWrapper>
                        <main className="my-custom-face-container">
                            <svg className="face" viewBox="0 0 320 380">
                                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={25}>
                                    <g className="face__eyes" transform="translate(0,112.5)">
                                        <g transform="translate(15,0)">
                                            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
                                            <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
                                        </g>
                                        <g transform="translate(230,0)">
                                            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
                                            <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
                                        </g>
                                    </g>
                                    <rect className="face__nose" x="132.5" y="112.5" width={55} height={155} rx={4} ry={4} />
                                    <g transform="translate(65,334)" strokeDasharray="102 102">
                                        <path className="face__mouth-left" d="M 0 30 C 0 30 40 0 95 0" />
                                        <path className="face__mouth-right" d="M 95 0 C 150 0 190 30 190 30" />
                                    </g>
                                </g>
                            </svg>
                        </main>
                    </FaceWrapper>
                </div>

                <div className="nf-card">
                    <h2 className="nf-title">Oops! Page not found.</h2>
                    <p className="nf-desc">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    
                    <div className="nf-actions">
                        <button onClick={() => window.history.back()} className="nf-btn nf-btn-back">
                            <ArrowLeft size={20} weight="bold" />
                            Go Back
                        </button>
                        
                        <Link to="/" className="nf-btn nf-btn-home">
                            <House size={20} weight="fill" />
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
