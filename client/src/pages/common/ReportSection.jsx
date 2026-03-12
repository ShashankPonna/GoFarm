import React, { useState } from 'react';

const ReportSection = () => {
  const [formData, setFormData] = useState({
    category: 'product',
    title: '',
    description: '',
    priority: 'medium',
    image: null
  });

  const [reports, setReports] = useState([
    {
      id: 1,
      category: 'Product Quality',
      title: 'Damaged vegetables received',
      description: 'Received tomatoes with bruises and damage',
      priority: 'high',
      status: 'pending',
      date: '2024-01-15',
      user: 'Ramesh Kumar'
    },
    {
      id: 2,
      category: 'Delivery Issue',
      title: 'Late delivery',
      description: 'Order was delivered 2 days late',
      priority: 'medium',
      status: 'in-progress',
      date: '2024-01-14',
      user: 'Priya Sharma'
    },
    {
      id: 3,
      category: 'Payment',
      title: 'Payment not received',
      description: 'Payment pending for order #12345',
      priority: 'high',
      status: 'resolved',
      date: '2024-01-13',
      user: 'Suresh Patel'
    }
  ]);

  const categories = [
    { value: 'product', label: 'Product Quality', icon: 'fa-box' },
    { value: 'delivery', label: 'Delivery Issue', icon: 'fa-truck' },
    { value: 'payment', label: 'Payment', icon: 'fa-credit-card' },
    { value: 'technical', label: 'Technical Issue', icon: 'fa-bug' },
    { value: 'other', label: 'Other', icon: 'fa-question-circle' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newReport = {
      id: reports.length + 1,
      category: categories.find(c => c.value === formData.category)?.label || 'Other',
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      user: 'You'
    };

    setReports([newReport, ...reports]);
    setFormData({
      category: 'product',
      title: '',
      description: '',
      priority: 'medium',
      image: null
    });
    alert('Report submitted successfully!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button onClick={() => window.history.back()} className="mr-4">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div>
            <h1 className="text-xl font-bold">Report Section</h1>
            <p className="text-sm text-blue-200">Submit issues and track reports</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i className="fas fa-flag text-blue-600 mr-3"></i>
                Submit a Report
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.category === cat.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <i className={`fas ${cat.icon} text-2xl mb-2`}></i>
                        <p className="text-sm font-medium">{cat.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about the issue..."
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map((priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                          formData.priority === priority
                            ? priority === 'high' ? 'border-red-500 bg-red-50 text-red-700' :
                              priority === 'medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                              'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attach Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600">
                        {formData.image ? formData.image.name : 'Click to upload image'}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Report
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Recent Reports */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Report Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="font-bold text-gray-800">{reports.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">
                    {reports.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-bold text-blue-600">
                    {reports.filter(r => r.status === 'in-progress').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolved</span>
                  <span className="font-bold text-green-600">
                    {reports.filter(r => r.status === 'resolved').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                Need Help?
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                For urgent issues, contact our support team directly.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors w-full">
                <i className="fas fa-phone mr-2"></i>
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <i className="fas fa-history text-gray-600 mr-3"></i>
            Recent Reports
          </h2>

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className="text-xs text-gray-500">{report.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>
                    <i className="fas fa-user mr-1"></i>
                    {report.user}
                  </span>
                  <span>
                    <i className="fas fa-calendar mr-1"></i>
                    {report.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSection;
