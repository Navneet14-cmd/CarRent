import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import './ProfileCard.css';
import carrentImg from '../assets/carrent.jpg';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#0f172a 0%,#1e293b 100%)';

const ProfileCardComponent = ({
  avatarUrl = carrentImg,       // ✅ fixed image from assets
  iconUrl = carrentImg,         // ✅ fixed image from assets
  grainUrl,
  innerGradient,
  behindGlowEnabled = false,    // ❌ removed glow (causes visual randomness)
  behindGlowColor,
  behindGlowSize,
  className = '',
  enableTilt = false,           // ❌ disabled tilt (causes shifting illusion)
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'User',
  title = 'Member',
  handle = 'user',
  status = 'Online',
  contactText = 'Contact',
  showUserInfo = true,
  onContactClick
}) => {

  const wrapRef = useRef(null);

  // ✅ CLEAN STYLE (NO RANDOM EFFECTS)
  const cardStyle = useMemo(() => ({
    '--icon': `url(${iconUrl})`,
    '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT
  }), [iconUrl, innerGradient]);

  const handleContactClick = useCallback(() => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`.trim()} style={cardStyle}>
      
      <div className="pc-card-shell">
        <section className="pc-card">

          <div className="pc-inside">

            {/* ❌ REMOVED shine + glare (they distort image) */}

            <div className="pc-content pc-avatar-content">
              <img
                className="avatar"
                src={avatarUrl}
                alt="avatar"
                loading="lazy"
              />

              {showUserInfo && (
                <div className="pc-user-info">

                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      <img
                        src={miniAvatarUrl || avatarUrl}
                        alt="mini avatar"
                      />
                    </div>

                    <div className="pc-user-text">
                      <div className="pc-handle">@{handle}</div>
                      <div className="pc-status">{status}</div>
                    </div>
                  </div>

                  <button
                    className="pc-contact-btn cursor-pointer"
                    onClick={handleContactClick}
                    type="button"
                  >
                    {contactText}
                  </button>

                </div>
              )}
            </div>

            <div className="pc-content">
              <div className="pc-details">
                <h3 className="m-0 text-white">{name}</h3>
                <p className="m-0 text-slate-400">{title}</p>
              </div>
            </div>

          </div>

        </section>
      </div>

    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;