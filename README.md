# Azayd IT Website

A modern website for Azayd IT built with Django and React.

## Project Structure

- Backend: Django REST Framework
- Frontend: React with TypeScript
- Build Tool: Vite

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm 8+

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - Windows: `.venv\Scripts\activate`
   - macOS/Linux: `source .venv/bin/activate`

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```
   npm install
   ```

2. Build the frontend (production):
   ```
   npm run build
   ```

   Or use the Django management command:
   ```
   python manage.py build_react
   ```

## Development

### Running the Development Server

1. Start the Django development server:
   ```
   python manage.py runserver
   ```

2. In a separate terminal, start the Vite development server:
   ```
   npm run dev
   ```

3. Access the application:
   - Django API: http://localhost:8000/api/
   - React frontend (dev): http://localhost:3000/

### API Endpoints

- `/api/services/` - List of services
- `/api/team/` - Team members
- `/api/jobs/` - Job postings
- `/api/contact/` - Contact form submission
- `/api/health/` - API health check

## Production Deployment

1. Set environment variables:
   - `DJANGO_SECRET_KEY`
   - `DJANGO_DEBUG=False`
   - `DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com`

2. Build the React frontend:
   ```
   python manage.py build_react
   ```

3. Collect static files:
   ```
   python manage.py collectstatic --noinput
   ```

4. Run the Django server with a production-ready WSGI server like Gunicorn:
   ```
   gunicorn azayd.wsgi:application
   ```

## Project Structure

```
├── azayd/              # Django project settings
├── website/            # Django app
│   ├── api_views.py    # API views
│   ├── models.py       # Data models
│   ├── serializers.py  # API serializers
│   ├── urls.py         # URL routing
│   └── views.py        # Traditional views
├── src/                # React frontend
│   ├── components/     # React components
│   ├── pages/          # React pages
│   ├── services/       # API services
│   └── main.tsx        # Entry point
├── templates/          # Django templates
├── static/             # Static files
├── media/              # User-uploaded files
├── manage.py           # Django management script
├── package.json        # Node.js dependencies
└── vite.config.ts      # Vite configuration
```