import './Switch.css';

const Switch = ({ uid = 'ham', checked, onChange, color = '#0F172A' }) => (
    <div className="ham-switch">
        <input
            type="checkbox"
            id={`${uid}-cb`}
            className="ham-cb"
            checked={checked}
            onChange={onChange}
        />
        <label htmlFor={`${uid}-cb`} className="ham-toggle">
            <span className="ham-bar ham-bar-1" style={{ backgroundColor: color }} />
            <span className="ham-bar ham-bar-2" style={{ backgroundColor: color }} />
            <span className="ham-bar ham-bar-3" style={{ backgroundColor: color }} />
        </label>
    </div>
);

export default Switch;
