import { useEffect, useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [disable, setDisable] = useState(true);
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  useEffect(() => {
    if (!credential || !password) setDisable(true);
    else setDisable(false);
  }, [credential, password])

  const setDemoUser = () => {
    setCredential('demo@user.io');
    setPassword('password');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data && data.errors) {
          setErrors(data.errors);
        }
      });
  };

  return (
    <div className='login-modal'>
      <h1 className='login-modal-title'>Log In</h1>
      <form className='login-modal-form' onSubmit={handleSubmit}>
        <label className='login-modal-label'>
          Username or Email:
          <input className='login-modal-input'
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label className='login-modal-label'>
          Password:
          <input className='login-modal-input'
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && (
          <p>{errors.credential}</p>
        )}
        <button className='login-button' type="submit" disabled={disable}>Log In</button>
        <button className='login-button' type="button" onClick={setDemoUser}>Demo User</button>
      </form>
    </div>
  );
}

export default LoginFormModal;