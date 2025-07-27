from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World! Flask is working.'

if __name__ == '__main__':
    print('Starting Flask server on port 5000...')
    app.run(debug=True, port=5000)