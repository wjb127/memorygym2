'use client';

import { useState } from 'react';
import SubjectForm from './SubjectForm';
import SubjectList from './SubjectList';

export default function SubjectManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 과목 목록 새로고침
  const refreshSubjects = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="space-y-6">
      <SubjectForm onSubjectAdded={refreshSubjects} />
      <SubjectList key={`subject-list-${refreshTrigger}`} />
    </div>
  );
} 