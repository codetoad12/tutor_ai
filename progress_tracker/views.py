from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Goal, GoalAttachment
from .serializers import GoalSerializer, GoalAttachmentSerializer

# Create your views here.

class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

class GoalToggleCompletionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        goal = get_object_or_404(Goal, pk=pk, user=request.user)
        goal.is_completed = not goal.is_completed
        goal.save()
        return Response({'status': 'goal completion toggled'})

class GoalAttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GoalAttachment.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        goal_id = self.request.data.get('goal')
        goal = get_object_or_404(Goal, id=goal_id, user=self.request.user)
        serializer.save(goal=goal)

class GoalAttachmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GoalAttachment.objects.filter(goal__user=self.request.user)
