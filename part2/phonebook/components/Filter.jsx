const Filter = ({ value, onChange }) => (
  <div>
    filter shown with: <input name="filter" value={value} onChange={onChange} />
  </div>
)

export default Filter
