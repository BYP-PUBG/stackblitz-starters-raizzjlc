.then(d => { if (d.error) setError(d.error); else setItems(d.items || []) })
