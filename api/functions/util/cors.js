module.exports = function setCors(req, res) {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('')
  }
}
