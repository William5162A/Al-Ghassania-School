import { FormEvent, useEffect, useState } from "react";
import { Button, LoadingScreen } from "@/components/ui";
import {
  defaultAdminIdentity,
  resolveAccountByUsername,
  setCurrentAdmin,
} from "../Admin/adminIdentity";
import {
  resolveAccountByUsername as resolveMentorAccount,
  setCurrentMentor,
} from "../Mentor/mentorIdentity";

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="login-field-icon"
      fill="currentColor"
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="login-field-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="login-control-icon"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="login-control-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.4 10.4 0 0 1 12 6c6 0 9.5 6 9.5 6a18 18 0 0 1-3.2 3.7" />
      <path d="M6.2 6.2C3.8 7.8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="login-button-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
    </svg>
  );
}

// function HeadsetIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       aria-hidden="true"
//       className="login-support-icon"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     >
//       <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
//       <path d="M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Z" />
//       <path d="M20 13a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z" />
//       <path d="M17 18c-.8 1.2-2.1 2-4 2h-1" />
//     </svg>
//   );
// }

function GoldDivider() {
  return (
    <div className="login-divider" aria-hidden="true">
      <span />
      <span className="login-divider-diamond">
        <span />
      </span>
      <span />
    </div>
  );
}

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  
    const normalizedUsername = username.trim().toLowerCase();
  
    if (normalizedUsername === "owner" && password === "owner123") {
      window.location.href = "/owner";
      return;
    }
  
    if (normalizedUsername === "admin" && password === "admin123") {
      setCurrentAdmin(defaultAdminIdentity());
      window.location.href = "/admin";
      return;
    }
  
    const adminIdentity = resolveAccountByUsername(normalizedUsername);
    if (adminIdentity && password === "admin123") {
      setCurrentAdmin(adminIdentity);
      window.location.href = "/admin";
      return;
    }
  
    // Mentor login
    const mentorIdentity = resolveMentorAccount(normalizedUsername);
    if (mentorIdentity && password === "mentor123") {
      setCurrentMentor(mentorIdentity);
      window.location.href = "/mentor";
      return;
    }
  
    alert("اسم المستخدم أو كلمة المرور غير صحيحة.");
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="login-page">
      {/* Background */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg-gradient" />

        <div className="login-light-wave login-light-wave-one" />
        <div className="login-light-wave login-light-wave-two" />

        <div className="login-logo-motion">
          <img
            src="/school-logo.png"
            alt=""
            className="login-school-logo"
          />
        </div>

        <div className="login-logo-overlay" />
      </div>
      {/* Login panel */}
      <div className="login-panel-position">
        <section className="login-panel">
          <div className="login-panel-inner">
            {/* Logo */}
            <div className="login-logo-wrapper">
              <img
                src="/school-logo.png"
                alt="شعار مدارس الغسانية"
                className="login-panel-logo"
              />
            </div>

            {/* Heading */}
            <div className="login-heading">
              <h1>مرحبا بك</h1>
              <p>في نظام مدارس الغسانية</p>
            </div>

            <GoldDivider />

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Username */}
              <div className="login-field">
                <label htmlFor="username">
                  اسم المستخدم أو البريد الإلكتروني
                </label>

                <div className="login-input-wrapper">
                  <UserIcon />

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label htmlFor="password">كلمة المرور</label>

                <div className="login-input-wrapper">
                  <LockIcon />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    aria-label={
                      showPassword
                        ? "إخفاء كلمة المرور"
                        : "إظهار كلمة المرور"
                    }
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                  />

                  <span>تذكرني</span>
                </label>

                {/* <button
                  type="button"
                  className="login-forgot"
                >
                  نسيت كلمة المرور؟
                </button> */}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="login-submit"
              >
                <span>تسجيل الدخول</span>
                <LoginIcon />
              </Button>
            </form>

            {/* Support
            <div className="login-support">
              <span>الدعم الفني: 011-1234567</span>
              <HeadsetIcon />
            </div> */}
          </div>
        </section>
      </div>
    </main>
  );
}