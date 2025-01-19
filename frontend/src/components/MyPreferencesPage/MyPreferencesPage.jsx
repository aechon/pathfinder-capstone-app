import { csrfFetch } from "../../store/csrf";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from "react-router-dom";
import { fetchUserPreferences, clearPreferences, deleteTag } from '../../store/preference';
import './MyPreferencesPage.css';



function MyPreferencesPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const { preferences, loading, error } = useSelector((state) => state.preference);
  const [ like, setLike ] = useState('');
  const [ dislike, setDislike ] = useState('');
  const [ disableLike, setDisableLike ] = useState(true);
  const [ disableDislike, setDisableDislike ] = useState(true);
  const [ likes, setLikes ] = useState([]);
  const [ dislikes, setDislikes ] = useState([]);
  const [ errors, setErrors ] = useState({})


  useEffect(() => {
    dispatch(fetchUserPreferences());

    return () => {
        dispatch(clearPreferences());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!preferences) return;
    setLikes(preferences.filter((tag) => {
      return tag.type === 'like';
    }));
    setDislikes(preferences.filter((tag) => {
      return tag.type === 'dislike';
    }));
  }, [preferences])

  useEffect(() => {
    if (like === '') {
      setDisableLike(true);
    } else {
      setDisableLike(false);
    }
  }, [like]);

  useEffect(() => {
    if (dislike === '') {
      setDisableDislike(true);
    } else {
      setDisableDislike(false);
    }
  }, [dislike]);

  // If not logged in redirect to homepage
  if (!sessionUser) return <Navigate to="/" replace={true} />;

  const handleAddTag = (tag, type) => {
    return async () => {
      const data = {
        type: type,
        tag: tag
      }
      await csrfFetch('/api/tags/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (response.ok) {
          dispatch(fetchUserPreferences());
          if (type === 'like') setLike('');
          if (type === 'dislike') setDislike('');
          setErrors({});
        }
      })
      .catch((err) => {
        let errorData = {};
        if (err) errorData = err.json();
        return errorData;
      }).then((err) => {
        if (err) setErrors(err);
      });
    }
  };

  if (loading) {
    <div className="tag-list-container">
      <div className="tag-list">
        <h2 className="tag-list-title">My Preferences</h2>
        <span className="add-tag-container">
          <label className="tag-label">
            <input 
              className='tag-input'
              type='text'
              value={like}
              onChange={(e) => setLike(e.target.value)} />
            <button 
              className='tag-button'
              onClick={handleAddTag(like, 'like')} 
              disabled={disableLike}>Add Like</button>
          </label>
          <label className="tag-label">
            <input 
              className='tag-input' 
              type='text' 
              value={dislike}
              onChange={(e) => setDislike(e.target.value)}/>
            <button 
              className='tag-button' 
              onClick={handleAddTag(dislike, 'dislike')}
              disabled={disableDislike}>Add Dislike</button>
          </label>
        </span>
        {errors.message && <p className="error-message">{errors.message}</p>}
        <div className="tags-container">
          Loading...
        </div>
      </div>
    </div>
  }

  if (error) {
    return <div className="tag-list-container">Error: {error.message || 'Failed to load preferences.'}</div>;
  }
  
  if (!preferences) {
    return <div className="tag-list-container">No user preferences found.</div>;
  }

  const handleDeleteTag = (id) => {
    return async () => {
      const response = await dispatch(deleteTag(id));
      
      if (response.ok) {
        dispatch(fetchUserPreferences());
        setErrors({});
      }
    }
  };

  return (
    <div className="tag-list-container">
      <div className="tag-list">
        <h2 className="tag-list-title">My Preferences</h2>
        <span className="add-tag-container">
          <label className="tag-label">
            <input 
              className='tag-input'
              type='text'
              value={like}
              onChange={(e) => setLike(e.target.value)} />
            <button 
              className='tag-button'
              onClick={handleAddTag(like, 'like')} 
              disabled={disableLike}>Add Like</button>
          </label>
          <label className="tag-label">
            <input 
              className='tag-input' 
              type='text' 
              value={dislike}
              onChange={(e) => setDislike(e.target.value)}/>
            <button 
              className='tag-button' 
              onClick={handleAddTag(dislike, 'dislike')}
              disabled={disableDislike}>Add Dislike</button>
          </label>
        </span>
        {errors.message && <p className="error-message">{errors.message}</p>}
        <div className="tags-container">
          {likes.map((tag)  => {
            return (
              <label className="tag like" key={tag.id}>
                {tag.tag}
                <button className="tag-remove-button" onClick={handleDeleteTag(tag.id)}>X</button>
              </label>
            )
          })}
          {dislikes.map((tag)  => {
            return (
              <label className="tag dislike" key={tag.id}>
                {tag.tag}
                <button className="tag-remove-button" onClick={handleDeleteTag(tag.id)}>X</button>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default MyPreferencesPage;