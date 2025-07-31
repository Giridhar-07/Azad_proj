from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.simple_tag(takes_context=True)
def csp_nonce(context):
    """
    Template tag to get the CSP nonce from the request.
    
    Usage in templates:
    {% load security_tags %}
    <script nonce="{% csp_nonce %}">...</script>
    <style nonce="{% csp_nonce %}">...</style>
    """
    request = context.get('request')
    if request and hasattr(request, 'csp_nonce'):
        return request.csp_nonce
    return ''

@register.filter(name='add_nonce')
def add_nonce(value, arg):
    """
    Filter to add nonce attribute to script and style tags.
    
    Usage in templates:
    {% load security_tags %}
    {{ my_script_html|add_nonce:request.csp_nonce }}
    """
    if not arg:
        return value
    
    if '<script' in value and not 'nonce=' in value:
        return value.replace('<script', f'<script nonce="{arg}"', 1)
    
    if '<style' in value and not 'nonce=' in value:
        return value.replace('<style', f'<style nonce="{arg}"', 1)
    
    return value