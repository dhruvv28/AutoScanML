from fpdf import FPDF
import os

SEVERITY_COLORS = {
    'High': (255, 102, 102),    # Red
    'Medium': (255, 255, 102),  # Yellow
    'Low': (102, 255, 102),     # Green
}

class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Swajyot Technologies Pvt Ltd', ln=1, align='C')
        self.set_font('Arial', '', 12)
        self.cell(0, 8, 'Vulnerability Scan Report', ln=1, align='C')
        self.ln(5)

    def section_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 102, 204)
        self.cell(0, 10, title, ln=1)
        self.set_text_color(0, 0, 0)
        self.ln(2)

    def add_table_of_contents(self, file_name):
        self.add_page()
        self.section_title('Table of Contents')
        self.set_font('Arial', '', 12)
        self.cell(0, 8, f'1. About This Report ............................................. 1', ln=1)
        self.cell(0, 8, f'2. Uploaded File: {file_name} .................................. 1', ln=1)
        self.cell(0, 8, f'3. Model Code .................................................. 2', ln=1)
        self.cell(0, 8, f'4. Vulnerability Summary ....................................... 3', ln=1)
        self.cell(0, 8, f'5. Static Vulnerabilities ....................................... 4', ln=1)
        self.cell(0, 8, f'6. Dynamic Vulnerabilities ...................................... 5', ln=1)
        self.cell(0, 8, f'7. Adversarial Vulnerabilities ................................. 6', ln=1)
        self.ln(5)

    def add_code_section(self, code_lines, vuln_lines):
        self.add_page()
        self.section_title('Model File Content')
        self.set_font('Courier', '', 9)
        for i, line in enumerate(code_lines, 1):
            if i in vuln_lines:
                color = SEVERITY_COLORS[vuln_lines[i]['severity']]
                self.set_fill_color(*color)
                self.cell(0, 5, f"{i:4d}: {line}", ln=1, fill=True)
            else:
                self.cell(0, 5, f"{i:4d}: {line}", ln=1)
        self.ln(2)

    def add_vuln_table(self, vulnerabilities, section_title='Vulnerability Summary Table', columns=None):
        self.add_page()
        self.section_title(section_title)
        self.set_font('Arial', 'B', 10)
        self.set_fill_color(200, 220, 255)
        if columns is None:
            columns = ['Line', 'Code', 'Severity', 'Attack']
        col_widths = [40, 60, 30, 60] if len(columns) == 4 else [60, 30, 60, 60]
        for i, col in enumerate(columns):
            self.cell(col_widths[i], 8, col, 1, 0, 'C', 1)
        self.ln()
        self.set_font('Arial', '', 9)
        for v in vulnerabilities:
            color = SEVERITY_COLORS.get(v.get('severity', 'Low'), (255,255,255))
            self.set_fill_color(*color)
            for i, col in enumerate(columns):
                value = v.get(col.lower(), v.get(col, '-'))
                if col.lower() == 'details' and isinstance(value, (dict, list)):
                    value = str(value)
                value = str(value)[:55] + ('...' if len(str(value)) > 55 else '')
                self.cell(col_widths[i], 8, value, 1, 0, 'L', 1)
            self.ln()

    def add_dynamic_section(self, dynamic_results):
        self.add_vuln_table(dynamic_results, section_title='Dynamic Vulnerabilities', columns=['Vulnerability', 'Severity', 'Description', 'Details'])

    def add_adversarial_section(self, adversarial_results):
        self.add_vuln_table(adversarial_results, section_title='Adversarial Vulnerabilities', columns=['Vulnerability', 'Severity', 'Description', 'Details'])


def generate_pdf_report(code_lines, static_vulns, dynamic_vulns, adversarial_vulns, output_path, file_name=None):
    pdf = PDF()
    pdf.add_page()
    # Cover page
    pdf.set_font('Arial', 'B', 20)
    pdf.set_text_color(0, 102, 204)
    pdf.cell(0, 30, 'Swajyot Technologies Pvt Ltd', ln=1, align='C')
    pdf.set_font('Arial', 'B', 16)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, 'Vulnerability Scan Report', ln=1, align='C')
    pdf.ln(10)
    if file_name:
        pdf.set_font('Arial', '', 14)
        pdf.cell(0, 10, f'File Scanned: {file_name}', ln=1, align='C')
    pdf.ln(20)
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, 'This report provides a detailed analysis of the uploaded machine learning model file, highlighting any detected vulnerabilities and summarizing the results in a clear, professional format.')
    pdf.ln(10)
    # Table of Contents
    pdf.add_table_of_contents(file_name or "<unknown>")
    # Model code section
    vuln_lines = {v['line']: v for v in static_vulns if 'line' in v}
    pdf.add_code_section(code_lines, vuln_lines)
    # Static Vulnerabilities
    pdf.add_vuln_table(static_vulns, section_title='Static Vulnerabilities')
    # Dynamic Vulnerabilities
    pdf.add_dynamic_section(dynamic_vulns)
    # Adversarial Vulnerabilities
    pdf.add_adversarial_section(adversarial_vulns)
    pdf.output(output_path)
