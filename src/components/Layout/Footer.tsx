
import React from "react";
import { Link } from "react-router-dom";
import { Award, Github, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-secondary py-8 md:py-12">
      <div className="container grid gap-8 px-4 md:px-6 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Award className="size-5 text-ethiopia-green" />
            <span className="font-semibold">Learnify Ethiopia</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-md">
            Helping Ethiopian students prepare for their national exams with personalized
            study resources, mock exams, and performance tracking.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:gap-6 lg:col-span-2">
          <div>
            <h3 className="mb-3 text-sm font-medium">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/subjects" className="hover:text-foreground">
                  Subjects
                </Link>
              </li>
              <li>
                <Link to="/exam" className="hover:text-foreground">
                  Mock Exams
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground">
                  Study Materials
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-3 text-sm font-medium">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="#" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="container mt-8 border-t border-border pt-8 px-4 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Learnify Ethiopia. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              to="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Twitter"
            >
              <Twitter className="size-4" />
            </Link>
            <Link
              to="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </Link>
            <Link
              to="#"
              className="text-muted-foreground hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
