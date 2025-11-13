import React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  Users,
  Shield,
  Mail,
  CheckCircle2,
  Globe,
  Workflow,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  const features = [
    {
      icon: BookOpen,
      title: "Assignment Management",
      description:
        "Create, manage, and track assignments efficiently across departments.",
    },
    {
      icon: Users,
      title: "Role-Based Dashboards",
      description:
        "Dedicated dashboards for Admins, Monitors, and Students with secure permissions.",
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "JWT-based access with AES encryption ensures complete data protection.",
    },
    {
      icon: Mail,
      title: "Smart Notifications",
      description:
        "Instant email and in-app notifications for assignment updates.",
    },
  ];

  const plans = [
    {
      title: "Student",
      price: "Free",
      features: [
        "Submit assignments",
        "View grades",
        "Receive feedback",
        "Email updates",
      ],
    },
    {
      title: "Monitor",
      price: "$9/mo",
      features: [
        "Create & review assignments",
        "Grade submissions",
        "Communicate with students",
        "Analytics dashboard",
      ],
    },
    {
      title: "Institution",
      price: "$49/mo",
      features: [
        "Unlimited users",
        "Advanced analytics",
        "Custom branding",
        "Priority support",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Ahmed",
      text: "Our faculty reduced assignment management time by 70%. The dashboard is intuitive and fast.",
      role: "Dean, EDUX University",
    },
    {
      name: "Amit Sharma",
      text: "An excellent platform for collaborative learning. Secure, fast, and beautifully designed.",
      role: "Lecturer, Bright Scholars College",
    },
  ];

  const workflowSteps = [
    {
      icon: Workflow,
      title: "Assignment Creation",
      text: "Admins or monitors create structured assignments with clear deadlines and grading criteria.",
    },
    {
      icon: ClipboardCheck,
      title: "Student Submission",
      text: "Students submit assignments through a secure, intuitive interface with upload tracking.",
    },
    {
      icon: Users,
      title: "Review & Feedback",
      text: "Monitors review submissions, provide detailed feedback, and assign grades instantly.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      text: "Admins access performance analytics and engagement metrics in real time.",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 transition-all duration-500">
      {/* NAVBAR */}
      <nav className="fixed w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
          >
            AssignPro
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-indigo-500">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow hover:shadow-lg transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <motion.section
        className="pt-40 pb-28 text-center relative overflow-hidden"
        style={{ y: y1 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
        >
          Simplify Education <br /> with Smart Assignment Management
        </motion.h1>
        <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto text-gray-600">
          A professional platform for schools and universities to manage
          assignments, submissions, and feedback in one place.
        </p>
        <div className="mt-10 flex justify-center gap-5">
          <Link
            to="/register"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            to="/learn-more"
            className="px-8 py-4 border border-gray-300 rounded-full hover:bg-gray-100 transition-all"
          >
            Learn More
          </Link>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white shadow-md border border-gray-200 hover:shadow-xl transition-all"
              >
                <feature.icon className="w-10 h-10 mx-auto text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM WORKFLOW (Animated Cards) */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white text-center">
        <Globe className="mx-auto mb-6 w-12 h-12" />
        <h2 className="text-4xl font-bold mb-6">System Planning & Workflow</h2>
        <p className="max-w-3xl mx-auto mb-16 opacity-90">
          AssignPro connects admins, monitors, and students through a seamless,
          automated workflow — from creation to grading — powered by smart
          analytics.
        </p>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:scale-105 hover:bg-white/20 transition-all"
            >
              <step.icon className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="opacity-90 text-sm">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-24 text-center">
        <h2 className="text-4xl font-bold mb-12">Flexible Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.title}
              whileHover={{ scale: 1.05 }}
              className="p-8 rounded-3xl bg-white border border-gray-200 shadow-md hover:shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-extrabold text-indigo-600 mb-4">
                {plan.price}
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="mb-2">
                    <CheckCircle2 className="inline-block w-5 h-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold"
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold mb-12">What People Are Saying</h2>
        <div className="max-w-3xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="mb-10">
              <p className="italic text-lg text-gray-600 mb-4">
                "{testimonial.text}"
              </p>
              <p className="font-semibold text-gray-800">
                - {testimonial.name}, <span className="text-gray-500">{testimonial.role}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p>© 2025 AssignPro. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
