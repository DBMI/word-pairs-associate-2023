import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { randomInt } from 'crypto';
import { AddWord } from '../add-word';
import { WordComponent } from '../word.component';
import { WordDirective } from '../word.directive';
import { Router } from '@angular/router';
import { AppModule } from '../app.module'; // yoannes
import Swal from 'sweetalert2'; // yoannes
import { WordService } from '../word.service';


const win: Window = window;

@Component({
  selector: 'app-word-associate-input',
  templateUrl: './word-associate-input.component.html',
})
export class WordAssociateInputComponent implements OnInit{
  // @Input() wordsInput: AddWord[] = [];
  // @Input() data: any;
  wordsInput: any[] = [];

  correctWord: string = '';
  errorMessage: string = '';
  correctMessage: string = '';
  currentWord: string = '';
  numError = 0;
  numCorrect =  0;
  numberCorrectPairs = 0;
  percentage = 0;
  numberOfWords = 40;
  inputElement: HTMLInputElement | undefined;

  current_date = this.getISOStringWithTimezone(); 
  // listOfPairs ="tower - bell,sea - tide,newspaper - interview,sonata - joy,banner - camp,tendency - increment,mother - child,insect - caterpillar,river - ship,coast - beach,gun - bullet,blacksmith - metal,home - room,building - hall,rain - flood,avenue - tree,decency - truth,decree - decision,diamond - hardness,result - effect,occupation - doctor,book - story,attack - operation,cat - soul,doll - cradle,episode - happiness,railroad - steam,kitchen - pot,countryside - swamp,musician - pianist,industry - factory,clothing - scarf,car - headlight,gale - wind,bouquet - blossom,bottle - toast,group - person,crisis - emergency,girl - engagement,harbor - crane"
  listOfPairs = '';
  indexArray: number[] = [];
  answerArray: string[] = [];
  // wordsInputToHeaderStr () {
    
  // }

  constructor(private router: Router,private globalService: AppModule,private wordService: WordService){}

  currentWordIndex = -1;
  counter = 0;

  @ViewChild(WordDirective, { static: true }) wordHost!: WordDirective;

  interval: number | any;

  ngOnInit(): void {
    this.wordsInput = this.wordService.getWordList(AppModule.listName);
    this.numberOfWords = this.wordsInput.length
    // TODO use this array to choose index of word-pair to present. 
    // Also need to create an answers array, and fill that by index to have answers recorded in the original order. 
    // Then update csv code to use the answers array, and to make a cell for storing the order presented to subject
    this.indexArray = Array.from({length:this.numberOfWords},(value,index)=>index).sort(() => Math.random() - 0.5);
    this.wordsInput.forEach(element => {
      this.listOfPairs += element.prompt + ' - ' + element.answer + ',';
    });
    // Remove trailing comma
    this.listOfPairs = this.listOfPairs.replace(/,\s*$/, "");

    this.inputElement = <HTMLInputElement>document.getElementById('userInputs');
    this.loadComponent();
  }

  //Focus cursor in input box for each set of words
  @ViewChild("userInputs")
  focus_element!: ElementRef;
  setFocus() {
    this.focus_element.nativeElement.focus();
  }

  ngAfterViewInit() {
    this.focus_element.nativeElement.focus();
  }

  // Time solution for iso formath with locale timezone 
  // taken from https://www.30secondsofcode.org/js/s/to-iso-string-with-timezone/
  pad (n: number) {
    return `${Math.floor(Math.abs(n))}`.padStart(2, '0')
  };
  getISOStringWithTimezone () {
    let date = new Date();
    let tzOffset = -date.getTimezoneOffset();
    let diff = tzOffset >= 0 ? '+' : '-';
    let pad = this.pad;
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      diff + pad(tzOffset / 60) //+
      // ':' + pad(tzOffset % 60); // Removing milliseconds upon request
  };

  loadComponent() {
    if (this.counter < this.numberOfWords) {
      this.inputElement!.disabled = false;
      this.inputElement!.value = '';
      this.errorMessage = '';
      this.correctMessage = '';
      this.inputElement!.focus();

      this.currentWordIndex = this.indexArray[this.counter];
      const addWordInput = this.wordsInput[this.currentWordIndex];
      this.currentWord = addWordInput.prompt;
      this.correctWord = addWordInput.answer;
      
      // const viewContainerRef = this.wordHost.viewContainerRef;
      // viewContainerRef.clear();

      // const componentRef = viewContainerRef.createComponent<WordComponent>(addWordInput.component);
      // componentRef.instance.data = addWordInput.data;
      //console.log("Testing: ", componentRef.instance.data );
      this.counter++;
      //console.log("Counter in alert: ", this.counter);
      setTimeout((expectedCurrentWord) => {
        handleTimeout(expectedCurrentWord);
       }, 10000, this.currentWord);
    }
  }
  //set the interval to minutes 
  // getWordsInputOne() {
  //   this.interval = window.setInterval(() => {
  //     this.loadComponent();
  //   }, 11000);//(11000) User has 11 seconds to fill in the blank yoannes time
  // }

  handleTimeout (expectedCurrentWord) {
     // If the list has moved to the next word, or an answer has been submitted for the current word, do nothing.
    if(this.currentWord == expectedCurrentWord && this.inputElement?.disabled == false) {
      if( (Date.now() - lastTypedTime)/1000 > 2){
        setTimeout((expectedCurrentWord) => {
          handleTimeout(expectedCurrentWord);
         }, 2000, this.currentWord);
      } else {
        this.onEnter(this.currentWord,this.correctWord, this.inputElement!.value);
      }
    }

  }

  // Handle keypress events. This will enabe tracking if the user is currently typing. 
  onKeyUp(event){
    this.lastTypedTime = Date.now();
    if(event.key === 'Enter'){
      this.onEnter(this.currentWord,this.correctWord, this.inputElement!.value)
    }
  }

  //Funtion with condition for different scenarios
  onEnter(fromDataList: string = '', correctWord: string, myuserInput: string) {

    console.log(AppModule.trainigTesting);
    
    this.inputElement!.disabled = true;
    
    myuserInput = myuserInput.trim().toLowerCase();
    this.answerArray[this.currentWordIndex] = myuserInput;
    
    if (correctWord.toLowerCase() === myuserInput) {
      // yoannes, checking time to print message if its evening
      if (AppModule.trainigTesting == "training") {
        this.correctMessage = "Correct answer"
      }
      this.numCorrect++;
    }
    else /* if (myuserInput != correctWord) */ {
    //   // yoannes, checking time to print message if its
      if (AppModule.trainigTesting == "training") {
        this.errorMessage = "The correct word is <b>" + correctWord+"</b>"; 
      }
      this.numError++;
    }

    
    //Wait then move to next word. 
    let loadTime = 1000; // 1 second if testing
      if (AppModule.trainigTesting == "training") {
        loadTime = 5000; // 5 seconds if training
      }
      setTimeout(() => {
        // Only progress if this is the last word
      if (this.counter == this.numberOfWords) {
        this.numberCorrectPairs = this.numCorrect                 //yoannes
        this.percentage = (this.numCorrect * 100)/this.numberOfWords              //yoannes

        if(AppModule.trainigTesting == "testing"){
          this.createCSVFile();  
          this.router.navigate(['/pass-test']);
        } else {
          this.popSweetAlert(fromDataList);
        }
      } else {
        this.loadComponent();
      }
    }, loadTime);
  };

  popSweetAlert(fromDataList: string) {
    
    if (this.numCorrect < 24) { // total of 40 words, 60% of 40 is 24 
      var thisComp = this;
      Swal.fire(
        {
          text: "You answered " + this.percentage + " % of the questions correctly. Please try again until you reach at least 60% of correctly answered questions.",
          showCancelButton: true,
          cancelButtonText: "End Test",
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Repeat Test',
          allowOutsideClick: false
        }
      ).then((result) => {
        if (result.value) {
          //win.location = "input-one"
          this.router.navigate(['/task-message']);
          // this.router.navigate(['/input-one']);
          // this.router.navigate(['/app-lits-one']);
          this.createCSVFile();  
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          //Asking the user to enter the Study ID to generate the file
          this.createCSVFile();  
            
          //Go to the home page
          this.router.navigate(['/pass-test']);
          AppModule.globalVariable = ""
        } 
      });
    }
    else if (this.numCorrect >= 24) { 
      Swal.fire(
        {
          text: "You answered " + this.percentage + " % out of "+this.numberOfWords+" words, Test completed"
        }
      ).then( () => {
        this.router.navigate(['/pass-test']);
      });
      this.createCSVFile();  
    }
  }

  // FRunction that creates the .CSV file //yoannes
  createCSVFile() {
    let studyID = AppModule.globalVariable;
    let numberOfWords = this.numberOfWords;
    let numberCorrectPairs: number = this.numberCorrectPairs;
    let percentage: number = this.percentage;
    let current_date: string = this.current_date;
    /* Define the data */
    let questionOrder  = '"';
    this.indexArray.forEach(index => {
      questionOrder += this.wordsInput[index].prompt+',';
    });
    questionOrder = questionOrder.replace(/,\s*$/, "");
    questionOrder  += '"';
    const data = [['Study ID', 'Number of Words', 'Number of Correct Pairs', '% of Correct Pairs', 'Training/Testing', 'Date', 'Question Order',this.listOfPairs]
    ,[studyID, numberOfWords ,numberCorrectPairs ,percentage +"%" , AppModule.trainigTesting, current_date, questionOrder, this.answerArray]];
    /* Convert the data to a CSV string */
    const csvContent = data.map(row => row.join(',')).join('\n');
    /* Create a Blob object containing the CSV string */
    const blob = new Blob([csvContent], { type: 'text/csv' });
    /* Create a link element */
    const link = document.createElement('a');
    /* Set the link's href to the Blob object */
    link.href = window.URL.createObjectURL(blob);
    /* Set the link's download attribute */
    link.download = AppModule.globalVariable + '-' + current_date +'.csv';
    /* Append the link to the document */
    document.body.appendChild(link);
    /* Click the link to trigger the download */
    link.click();
    /* Remove the link from the document */
    document.body.removeChild(link);
  }
  
}

