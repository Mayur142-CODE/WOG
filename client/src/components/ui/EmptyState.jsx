import s from './EmptyState.module.css';

const EmptyState = ({ icon, title = 'Nothing here yet', description, action }) => (
  <div className={s.wrapper}>
    {icon && <div className={s.iconBox}>{icon}</div>}
    <div>
      <p className={s.title}>{title}</p>
      {description && <p className={s.description}>{description}</p>}
    </div>
    {action && <div className={s.action}>{action}</div>}
  </div>
);

export default EmptyState;
