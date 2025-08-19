#backend

import tkinter as tk
from tkinter import messagebox, ttk

# ====== BAZA DANYCH KARIER ======
career_database = [
    {
        "name": "Copywriter",
        "skills": ["pisanie", "marketing", "kreatywność"],
        "interests": ["reklama", "język", "media"],
        "level": 2
    },
    {
        "name": "Programista",
        "skills": ["python", "logika", "algorytmy"],
        "interests": ["technologia", "gry", "problemy logiczne"],
        "level": 3
    },
    {
        "name": "Grafik",
        "skills": ["photoshop", "kreatywność", "kompozycja"],
        "interests": ["sztuka", "projektowanie", "estetyka"],
        "level": 2
    },
    {
        "name": "Data Scientist",
        "skills": ["python", "statystyka", "machine learning"],
        "interests": ["dane", "analiza", "technologia"],
        "level": 4
    },
    {
        "name": "UX Designer",
        "skills": ["projektowanie", "empatia", "badania"],
        "interests": ["ludzie", "psychologia", "design"],
        "level": 3
    }
]

# ====== KLASY LOGIKI ======
class UserProfile:
    def __init__(self, name, skills, interests):
        self.name = name
        self.skills = [s.strip().lower() for s in skills if s.strip()]
        self.interests = [i.strip().lower() for i in interests if i.strip()]
        self.level = 1  # Domyślny poziom początkowy

class CareerMatcher:
    def __init__(self, career_db):
        self.career_db = career_db

    def match_careers(self, user_profile):
        matches  =[]
        for career in self.career_db:
            skill_match = len(set(career['skills']) &set(user_profile.skills))
            interest_match = len(set(career['interests']) & set(user_profile.interests))


            total_possible = len(career['skills']) + len(career['interests'])
            actual_match = skill_match + interest_match


            percentage = (actual_match / total_possible *100) if not total_possible > 0 else 0
            matches.append({
                'name': career['name'],
                'score': actual_match,
                'percentage': round(percentage, 1),
                'skill_match': skill_match,
                'interest_match': interest_match,
                'career_data': career,
                'difficulty': career['level']
            })


            matches.append({
                'name': career['name'],
                'score': actual_match,
                'percentage': round(percentage, 1),
                'skill_match': skill_match,
                'interest_match': interest_match,
                'career_data': career,
                'difficulty': career['level']
            })
        
        return sorted(matches, key=lambda x: x['percentage'], reverse=True)
    
class SkillDevelopmentPlan:
    def __init__(self, user_profile , chosen_career):
        self.user =user_profile
        self.career = chosen_career

    def suggest_skills( self):
        missing_skills =list(set(self.career['skills'])  -set(self.user.skills))
        missing_interests =list(set(self.career['interests']) -set(self.user_interests))
        return missing_skills , missing_interests
    



class CareerApp:
    def __init__ (self,root):
        self.root = root
        self.root.title = ("🎯 Kreator Kariery - PathFinder")
        self.root.geometry("600x500")
        self.root.configure(bg='#f0f0f0')

        self.matcher = CareerMatcher(career_database)
        self.current_user = None
        
        self._build_main_screen()

    def _build_main_screen(self):
        main_frame = tk.Frame(self.root , bg='#f0f0f0' , padx=20 ,pady=20)
        main_frame.pack(fill='both' ,expand=True)
        

        header_frame =  tk.Frame(main_framebg='#3498db', height=80)
        header_frame.pack(fill="x", pady=(0, 20))


        tk.Label(
              header_frame,
            text="🎯 Kreator Kariery",
            font=("Arial", 24, "bold"),
            bg='#3498db',
            fg='white'
        ).pack(pady=20)
        
        form_frame = tk.Frame(main_frame, bg='white' , padx=30, pady=30)
        form_frame.pack (fill='both' , expand=True)
        tk.Label(
            form_frame,
            text="Twoje imię:",
            font=("Arial", 12),
            bg='white'
        ).grid(row=0, column=0, sticky="w", pady=10)

        tk.Label(
            form_frame,
            text="Twoje imię:",
            font=("Arial", 12),
            bg='white'
        ).grid(row=0, column=0, sticky="w", pady=10)


        tk.Label(
            
            text="(np: python, pisanie, marketing - oddziel przecinkami)",
            font=("Arial", 9),
            fg='gray',
            bg='white'
        ).pack(anchor="w")
        
        # Pole: Zainteresowania
        tk.Label(
            form_frame,
            text="Zainteresowania:",
            font=("Arial", 12),
            bg='white'
        ).grid(row=2, column=0, sticky="nw", pady=10)
        
        interests_frame = tk.Frame(form_frame, bg='white')
        interests_frame.grid(row=2, column=1, pady=10, padx=10, sticky="w")
        
        self.entry_interests = tk.Entry(interests_frame, font=("Arial", 11), width=40)
        self.entry_interests.pack()
        
        tk.Label(
            interests_frame,
            text="(np: technologia, sztuka, ludzie - oddziel przecinkami)",
            font=("Arial", 9),
            fg='gray',
            bg='white'
        ).pack(anchor="w")
        
        # Przyciski
        button_frame = tk.Frame(form_frame, bg='white')
        button_frame.grid(row=3, column=0, columnspan=2, pady=30)
        
        tk.Button(
            button_frame,
            text="🔍 Znajdź moją ścieżkę",
            command=self.analyze,
            font=("Arial", 12, "bold"),
            bg='#2ecc71',
            fg='white',
            padx=20,
            pady=10
        ).pack(side="left", padx=5)
        
        tk.Button(
            button_frame,
            text="📊 Przykładowe dane",
            command=self.load_example,
            font=("Arial", 12),
            bg='#3498db',
            fg='white',
            padx=20,
            pady=10
        ).pack(side="left", padx=5)
        
        # Status bar
        self.status = tk.StringVar(value="Gotowy do analizy...")
        status_bar = tk.Label(
            main_frame,
            textvariable=self.status,
            font=("Arial", 10),
            bg='#f0f0f0',
            fg='#7f8c8d'
        )
        status_bar.pack(fill="x", side="bottom", pady=(10, 0))

    def load_example(self):
        """Wypełnia formularz przykładowymi danymi"""
        self.entry_name.delete(0, tk.END)
        self.entry_name.insert(0, "Jan")
        
        self.entry_skills.delete(0, tk.END)
        self.entry_skills.insert(0, "python, logika, kreatywność")
        
        self.entry_interests.delete(0, tk.END)
        self.entry_interests.insert(0, "technologia, gry, projektowanie")
        
        self.status.set("Załadowano przykładowe dane")

    def analyze(self):
        """Główna funkcja analizy dopasowania"""
        name = self.entry_name.get().strip()
        skills = self.entry_skills.get().split(',')
        interests = self.entry_interests.get().split(',')
        
        # Walidacja
        if not name:
            messagebox.showwarning("⚠️ Uwaga", "Proszę podać imię")
            return
        
        if not any(skills) and not any(interests):
            messagebox.showwarning(
                "⚠️ Uwaga",
                "Podaj przynajmniej jedną umiejętność lub zainteresowanie"
            )
            return
        
        # Analiza
        self.current_user = UserProfile(name, skills, interests)
        results = self.matcher.match_careers(self.current_user)

        if not results or  results[0] ['percentage'] == 0:
             messagebox.showinfo(
                 'Wynik',
                 'Nie znaleziono dopasowań. Spróbuj dodać więcej informacji'
             )
             return
        self.status.set(f'znaleziono {len(results)} sciezek kariery dla {name}')
        self._show_results_window(results)
    

    def _show_results_window(self, results):
        result_window = tk.Toplevel(self.root)
        result_window.title = (f'Twoje ścieżki możliwości - {self.current_user.name}')
        result_window.geometry('700x500')
 
        

        header = tk.Frame(result_window , bg='#2ecc71', height=60)
        header.pack(fill="x")
        
        tk.Label(
            header,
            text=f"Najlepsze dopasowania dla {self.current_user.name}",
            font=("Arial", 16, "bold"),
            bg='#2ecc71',
            fg='white'
        ).pack(pady=15)

        results_frame = tk.Frame(result_window, padx=20, pady=20)
        results_frame.pack(fill="both", expand=True)

        colums = ('Kariera' , 'Dopasowanie' , 'Umiejętności' , 'Zainteresowania' , 'Poziom ')
        tree =ttk.Treeview(results_frame , columns=colums , show='heading'  , height=12)


        tree.heading('Kariera', text= 'Kariera')
        tree.heading('Dopasowanie', text=' Dopasowanie')
        tree.heading('Umiejętności', text=' Umiejętności')
        tree.heading('Zainteresowania', text=' Zainteresowania')
        tree.heading('Poziom', text=' Poziom')
        
        tree.column('Kariera', width=150)
        tree.column('Dopasowanie', width=120, anchor='center')
        tree.column('Umiejętności', width=120, anchor='center')
        tree.column('Zainteresowania', width=140, anchor='center')
        tree.column('Poziom', width=100, anchor='center')

        for i, result in  enumerate(results[:10]):
            poziom_text ='⭐' * result['difficulty']
            tree.insert('' , 'end ', values=(
                f'{result['percentage']}%',
                f'{result['skill_match']}/{len(result['career_data']['interests'])}',
                poziom_text
            ))

            tree.pack(fill='both' , expand=True)


            self.current_results =results

            action_frame = tk.Frame(results_frame)
            action_frame.pack(fill='x' , pady=(10,0))


            def show_development_plan():
                selection = tree.selection()
                if not selection:
                    messagebox.showwarning("⚠️", "Wybierz ścieżkę kariery z listy")
                    return
            
                index = tree.index(selection[0])
                chosen_career = self.current_results[index] ['career_data']

                plan = SkillDevelopmentPlan(self.current_user, chosen_career)
                missing_skills , missing_interests = plan.suggest_skills()
                msg = f' Plan rozwoju dla {chosen_career['name']}\n\n'

                if missing_skills:
                    msg += "📚 Umiejętności do odkrycia:\n"
                    msg += "\n".join(f"  • {skill}" for skill in missing_skills)
                    msg += "\n\n"

                if missing_interests:
                    msg += " Obszary do eksploracji:\n"
                    msg += "\n".join(f"  • {interest}" for interest in missing_interests)
            
                if not missing_skills and not missing_interests:
                   msg += "✅ Świetnie! Masz wszystkie wymagane umiejętności i zainteresowania!"

                messagebox.showinfo("📋 Plan Rozwoju", msg)

            tk.Button(
            action_frame,
            text="📋 Pokaż plan rozwoju",
            command=show_development_plan,
            font=("Arial", 11, "bold"),
            bg='#3498db',
            fg='white',
            padx=15,
            pady=8
        ).pack(side="left", padx=5)
        



        tk.Button(
            action_frame,
            text="❌ Zamknij",
            command=result_window.destroy,
            font=("Arial", 11),
            bg='#e74c3c',
            fg='white',
            padx=15,
            pady=8
        ).pack(side="right", padx=5)



if __name__ == "__main__":
    root = tk.Tk()
    app = CareerApp(root)
    root.mainloop()