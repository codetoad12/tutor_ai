from django.db import models

class ChoicesField(models.CharField):
    """
    A custom field that works with enum values defined in choices.py files.
    This field ensures that only valid enum values can be stored.
    """
    def __init__(self, enum_class, *args, **kwargs):
        self.enum_class = enum_class
        # Set max_length to the length of the longest enum value
        max_length = max(len(choice.value) for choice in enum_class)
        kwargs['max_length'] = max_length
        kwargs['choices'] = [(choice.value, choice.name) for choice in enum_class]
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['enum_class'] = self.enum_class
        return name, path, args, kwargs

    def get_prep_value(self, value):
        if value is None:
            return None
        if hasattr(value, 'value'):
            return value.value
        return value

    def from_db_value(self, value, expression, connection):
        if value is None:
            return None
        return self.enum_class(value)

    def to_python(self, value):
        if value is None:
            return None
        if isinstance(value, self.enum_class):
            return value
        return self.enum_class(value) 